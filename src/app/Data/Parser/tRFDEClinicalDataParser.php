<?php


namespace App\Data\Parser;


use App\Data\CachedReader;
use App\Data\Common;
use RuntimeException;
use Storage;

class tRFDEClinicalDataParser extends AbstractParser
{

    private $clinicalData = [];
    private $rawData = [];
    private $headers = [];

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readList();
        $this->filterList();
        $this->prepareList();
        self::writeJsonFile(Common::TCGA_CLINICAL_DE_BY_DATASET, $this->clinicalData);
        Storage::disk('local')->makeDirectory(Common::TCGA_CLINICAL_DE_FOLDER);
        foreach ($this->rawData as $datasetType => $data) {
            self::writeTSV(Common::TCGA_CLINICAL_DE_FOLDER . '/' . $datasetType . '.tsv', $data, $this->headers);
        }
    }

    private function readList(): void
    {
        if (($handle = gzopen($this->inputFile, 'r')) !== false) {
            $this->headers = fgetcsv($handle, 1000, "\t");
            $fields = count($this->headers);
            $datasetField = $fields - 2;
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != $fields) {
                    continue;
                }
                $dataset = $data[$datasetField];
                if (!isset($this->rawData[$dataset])) {
                    $this->rawData[$dataset] = [];
                    $this->clinicalData[$dataset] = [];
                }
                $this->rawData[$dataset][] = $data;
                for ($i = 1; $i < $fields; $i++) {
                    if ($i == $datasetField) {
                        continue;
                    }
                    if (!isset($this->clinicalData[$dataset][$this->headers[$i]])) {
                        $this->clinicalData[$dataset][$this->headers[$i]] = [];
                    }
                    $value = self::handleNA($data[$i], null);
                    if ($value !== null) {
                        $this->clinicalData[$dataset][$this->headers[$i]][$value] = $value;
                    }
                }
            }
            gzclose($handle);
        } else {
            throw new RuntimeException("Unable to open tRF list file");
        }
    }

    /**
     * Filter tRF clinical data removing variables with only one value
     */
    private function filterList()
    {
        $datasets = array_keys($this->clinicalData);
        foreach ($datasets as $dataset) {
            $clinicalVarsValues = array_filter(
                $this->clinicalData[$dataset],
                function ($v) {
                    return is_array($v) && count($v) > 1;
                }
            );
            $availableClinicalVars = array_keys($clinicalVarsValues);
            $availableClinicalVars = array_combine($availableClinicalVars, $availableClinicalVars);
            $this->clinicalData[$dataset] = [
                'values'    => $clinicalVarsValues,
                'variables' => $availableClinicalVars,
            ];
        }
        ksort($this->clinicalData);
    }

    /**
     * Format the list for Web UI
     */
    private function prepareList()
    {
        $allClinicalData = $this->clinicalData;
        $datasets = array_keys($this->clinicalData);
        $this->clinicalData = [
            'datasets'                   => array_combine($datasets, $datasets),
            'variablesByDataset'         => array_map(
                function ($data) {
                    return $data['variables'];
                },
                $allClinicalData
            ),
            'valuesByDatasetAndVariable' => array_map(
                function ($data) {
                    return $data['values'];
                },
                $allClinicalData
            ),
        ];
    }

}
