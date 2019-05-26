<?php


namespace App\Data\Parser;


use App\Data\Common;
use RuntimeException;

class CorrelationTablesParser extends AbstractParser
{

    private $allDatasets;
    private $finalDatasets = [
        'measures'          => ['pearson' => 'Pearson', 'spearman' => 'Spearman'],
        'datasetsByMeasure' => [],
    ];

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readDatasetsList();
        $this->readDatasets();
        self::writeJsonFile(Common::CORRELATION_DATASETS, $this->finalDatasets);
    }

    private function readDatasetsList(): void
    {
        if (($handle = gzopen($this->inputFile, 'r')) !== false) {
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != 2) {
                    continue;
                }
                $id = trim($data[0]);
                $name = trim($data[1]);
                $this->allDatasets[$id] = $name;
            }
            gzclose($handle);
        } else {
            throw new RuntimeException("Unable to open dataset list file");
        }
    }

    private static function buildNode(string $id, string $name, string $type): array
    {
        return [
            'data' => [
                'id'   => md5($id),
                'name' => $name,
                'type' => $type,
            ],
        ];
    }

    private static function buildEdge(string $id, string $source, string $target, string $type, float $value): array
    {
        return [
            'data' => [
                'id'     => $id,
                'source' => md5($source),
                'target' => md5($target),
                'type'   => $type,
                'width'  => 6 * abs($value),
            ],
        ];
    }

    private function buildGraphData(array &$tableData): array
    {
        $graphData = [
            'nodes' => [],
            'edges' => [],
        ];
        foreach ($tableData as $row) {
            $graphData['nodes'][$row['rowId']] = self::buildNode($row['rowId'], $row['rowId'], 'row');
            $graphData['nodes'][$row['tRF']] = self::buildNode($row['tRF'], $row['tRF'], 'col');
            $type = ($row['correlation'] > 0) ? 'correlation' : 'anticorrelation';
            $graphData['edges'][$row['key']] = self::buildEdge(
                $row['key'],
                $row['rowId'],
                $row['tRF'],
                $type,
                $row['correlation']
            );
        }

        return array_merge(array_values($graphData['nodes']), array_values($graphData['edges']));
    }

    private function readDatasets(): void
    {
        foreach ($this->finalDatasets['measures'] as $measure => $measureName) {
            $toRemove = [];
            foreach ($this->allDatasets as $id => $name) {
                $inputFile = resource_path(sprintf(Common::CORRELATION_INPUT_BASE, $measure, $id));
                $outputFile = sprintf(Common::CORRELATION_DATASET_BASE, $measure, $id);
                $tableData = [];
                if (($handle = gzopen($inputFile, 'r')) !== false) {
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
                    gzclose($handle);
                } else {
                    throw new RuntimeException("Unable to open dataset file");
                }
                if (count($tableData) > 0) {
                    self::writeJsonFile(
                        $outputFile,
                        $tableData
                    /*[
                        'table' => $tableData,
                        'graph' => $this->buildGraphData($tableData),
                    ]*/
                    );
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
