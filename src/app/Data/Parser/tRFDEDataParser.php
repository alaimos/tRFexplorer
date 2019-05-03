<?php


namespace App\Data\Parser;


use App\Data\CachedReader;
use App\Data\Common;
use RuntimeException;
use Storage;

class tRFDEDataParser extends AbstractParser
{

    private $tRFData = [];
    private $rawData = [];
    private $header = [];

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readList();
        self::writeJsonFile(Common::TCGA_CLINICAL_DE_BY_DATASET, $this->tRFData);
        Storage::disk('local')->makeDirectory(Common::TCGA_CLINICAL_DE_FOLDER);
        foreach ($this->rawData as $datasetType => $data) {
            self::writeTSV(Common::TCGA_CLINICAL_DE_FOLDER . '/' . $datasetType . '.tsv', $data, $this->header);
        }
    }

    private function readList(): void
    {
        if (($handle = fopen($this->inputFile, 'r')) !== false) {
            $this->header = fgetcsv($handle, 1000, "\t");
            $fields = count($this->header);
            $datasetField = $fields - 2;
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != $fields) {
                    continue;
                }
                $dataset = $data[$datasetField];
                if (!isset($this->rawData[$dataset])) {
                    $this->rawData[$dataset] = [];
                    $this->tRFData[$dataset] = [];
                }
                $this->rawData[$dataset][] = $data;
                for ($i = 1; $i < $fields; $i++) {
                    if ($i == $datasetField) {
                        continue;
                    }
                    if (!isset($this->tRFData[$dataset][$this->header[$i]])) {
                        $this->tRFData[$dataset][$this->header[$i]] = [];
                    }
                    $value = self::handleNA($data[$i], null);
                    if ($value !== null) {
                        $this->tRFData[$dataset][$this->header[$i]][$value] = $value;
                    }
                }
            }
            fclose($handle);
        } else {
            throw new RuntimeException("Unable to open tRF list file");
        }
    }

}
