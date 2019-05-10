<?php


namespace App\Data\Parser;


use App\Data\Common;
use RuntimeException;

class CorrelationTablesParser extends AbstractParser
{

    private $allDatasets;
    private $finalDatasets = [
        'measures'          => ['pearson' => 'Pearson'],
        'datasetsByMeasure' => [],
    ];

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readDatasetsList();
        $this->readDatasets();
        self::writeJsonFile(Common::CORRELATION_NCI60_DATASETS, $this->finalDatasets);
    }

    private function readDatasetsList(): void
    {
        if (($handle = fopen($this->inputFile, 'r')) !== false) {
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != 2) {
                    continue;
                }
                $id = trim($data[0]);
                $name = trim($data[1]);
                $this->allDatasets[$id] = $name;
            }
            fclose($handle);
        } else {
            throw new RuntimeException("Unable to open dataset list file");
        }
    }

    private function readDatasets(): void
    {
        foreach ($this->finalDatasets['measures'] as $measure => $measureName) {
            $toRemove = [];
            foreach ($this->allDatasets as $id => $name) {
                $inputFile = resource_path(sprintf(Common::CORRELATION_NCI60_INPUT_BASE, $measure, $id));
                $outputFile = sprintf(Common::CORRELATION_NCI60_DATASET_BASE, $measure, $id);
                $tableData = [];
                if (($handle = fopen($inputFile, 'r')) !== false) {
                    $data = fgetcsv($handle, 1000, "\t"); // SKIP FIRST LINE
                    while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                        $num = count($data);
                        if ($num != 6) {
                            continue;
                        }
                        $tableData[] = [
                            'key'         => md5($data[0] . '-' . $data[1]),
                            'rowId'       => $data[0],
                            'tRF'         => $data[1],
                            'id'          => $data[4],
                            'name'        => $data[3],
                            'position'    => $data[5],
                            'correlation' => doubleval($data[2]),
                        ];
                    }
                    fclose($handle);
                } else {
                    throw new RuntimeException("Unable to open dataset file");
                }
                if (count($tableData) > 0) {
                    self::writeJsonFile($outputFile, $tableData);
                } else {
                    $toRemove[] = $id;
                }
            }
            if (count($toRemove) > 0) {
                $this->finalDatasets['datasetsByMeasure'][$measure] = array_filter(
                    $this->allDatasets,
                    function ($key) use ($toRemove) {
                        return !in_array($key, $toRemove);
                    },
                    ARRAY_FILTER_USE_KEY
                );
            }
        }
    }

}
