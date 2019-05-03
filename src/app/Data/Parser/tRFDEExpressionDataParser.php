<?php


namespace App\Data\Parser;

use App\Data\Common;
use RuntimeException;
use Storage;

class tRFDEExpressionDataParser extends AbstractParser
{

    /**
     * @var string
     */
    private $clinicalInputFile;

    /**
     * @var array
     */
    private $data = [];

    /**
     * @var array
     */
    private $headers = [];

    /**
     * @var null|array
     */
    private $clinicalData = [];

    /**
     * tRFDEExpressionDataParser constructor.
     *
     * @param string $inputFile
     * @param string $clinicalInputFile
     */
    public function __construct(string $inputFile, string $clinicalInputFile)
    {
        parent::__construct($inputFile);
        $this->clinicalInputFile = $clinicalInputFile;
    }

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readClinicalData();
        $this->readData();
        Storage::disk('local')->makeDirectory(Common::TCGA_EXPRESSION_DE_FOLDER);
        foreach ($this->data as $dataset => $data) {
            self::writeTSV(
                Common::TCGA_EXPRESSION_DE_FOLDER . '/' . $dataset . '.tsv',
                $data,
                $this->headers[$dataset]
            );
        }
    }

    /**
     * Read clinical data from file
     */
    private function readClinicalData(): void
    {
        if (($handle = fopen($this->clinicalInputFile, 'r')) !== false) {
            $header = fgetcsv($handle, 1000, "\t");
            $fields = count($header);
            $datasetField = $fields - 2;
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != $fields) {
                    continue;
                }
                $sample = $data[0];
                $dataset = $data[$datasetField];
                $this->clinicalData[$sample] = $dataset;
                if (!isset($this->data[$dataset])) {
                    $this->data[$dataset] = [];
                }
            }
            fclose($handle);
        } else {
            throw new RuntimeException("Unable to open tRF list file");
        }
    }

    /**
     * Read headers dividing them by dataset
     *
     * @param array $samples
     */
    private function readHeaders(array $samples): void
    {
        $this->headers = [];
        for ($i = 0; $i < count($samples); $i++) {
            $sample = $samples[$i];
            $dataset = $this->clinicalData[$sample] ?? null;
            if ($dataset === null) {
                continue;
            }
            if (!isset($this->headers[$dataset])) {
                $this->headers[$dataset] = [];
            }
            $this->headers[$dataset][] = $samples[$i];
        }
    }

    /**
     * Read data from input file
     */
    private function readData(): void
    {
        if (($handle = fopen($this->inputFile, 'r')) !== false) {
            $samples = fgetcsv($handle, 0, "\t");
            $rowSize = count($samples);
            while (($data = fgetcsv($handle, 0, "\t")) !== false) {
                $num = count($data) - 1;
                if ($num != $rowSize) {
                    continue;
                }
                $tRFId = array_shift($data);
                for ($i = 0; $i < $num; $i++) {
                    $sample = $samples[$i];
                    $dataset = $this->clinicalData[$sample] ?? null;
                    if ($dataset === null) {
                        continue;
                    }
                    if (!isset($this->data[$dataset][$tRFId])) {
                        $this->data[$dataset][$tRFId] = [$tRFId];
                    }
                    $this->data[$dataset][$tRFId][] = self::handleNA($data[$i], NAN, "intval") ?? 0;
                }
            }
            fclose($handle);
            $datasets = array_keys($this->data);
            foreach ($datasets as $dataset) {
                $this->data[$dataset] = array_values($this->data[$dataset]);
            }
            $this->readHeaders($samples);
        } else {
            throw new RuntimeException("Unable to open expression data file");
        }
    }

}
