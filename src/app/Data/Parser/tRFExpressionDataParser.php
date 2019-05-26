<?php


namespace App\Data\Parser;

use App\Data\CachedReader;
use RuntimeException;
use Storage;

class tRFExpressionDataParser extends AbstractParser
{

    /**
     * @var string
     */
    private $outputFile;

    /**
     * @var array
     */
    private $data = [];

    /**
     * @var null|array
     */
    private $clinicalData = null;

    /**
     * tRFExpressionDataParser constructor.
     *
     * @param string      $inputFile
     * @param string      $outputFile
     * @param string|null $clinicalInputFile
     *
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public function __construct(string $inputFile, string $outputFile, string $clinicalInputFile = null)
    {
        parent::__construct($inputFile);
        $this->outputFile = $outputFile;
        if ($clinicalInputFile !== null) {
            $this->clinicalData = CachedReader::json($clinicalInputFile, 'local', true);
        }
    }

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readData();
        $this->orderData();
        Storage::disk('local')->makeDirectory(dirname($this->outputFile));
        foreach ($this->data as $tRF => $data) {
            $key = md5($tRF);
            self::writeJsonFile(sprintf($this->outputFile, $key), $data);
        }
    }

    private function orderData()
    {
        $allSamples = $this->clinicalData['samples'] ?? null;
        if (is_array($allSamples)) {
            $tRFs = array_keys($this->data);
            foreach ($tRFs as $tRF) {
                $tmp = [];
                foreach ($allSamples as $sample) {
                    $tmp[] = $this->data[$tRF][$sample] ?? 0.0;
                }
                $this->data[$tRF] = $tmp;
            }
        }
    }

    private function readData(): void
    {
        if (($handle = gzopen($this->inputFile, 'r')) !== false) {
            $samples = fgetcsv($handle, 0, "\t");
            $rowSize = count($samples);
            while (($data = fgetcsv($handle, 0, "\t")) !== false) {
                $num = count($data) - 1;
                if ($num != $rowSize) {
                    continue;
                }
                $tRFId = array_shift($data);
                $this->data[$tRFId] = [];
                for ($i = 0; $i < $num; $i++) {
                    $this->data[$tRFId][$samples[$i]] = self::handleNA($data[$i], NAN, "doubleval");
                }
            }
            gzclose($handle);
        } else {
            throw new RuntimeException("Unable to open expression data file");
        }
    }

}
