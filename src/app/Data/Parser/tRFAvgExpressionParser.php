<?php


namespace App\Data\Parser;

use App\Data\Common;
use RuntimeException;

class tRFAvgExpressionParser extends AbstractParser
{

    private $tRFByDataset = [];
    private $tRFByTissueType = [];
    private $tRFByDatasetAndTissue = [];
    private $tissueTypes = [];
    private $tissueTypesByDataset = [];
    private $datasets = [];

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readList();
        self::writeJsonFile(Common::DATASETS_FILE, $this->datasets);
        self::writeJsonFile(Common::TISSUE_TYPES_FILE, $this->tissueTypes);
        self::writeJsonFile(Common::TISSUE_TYPES_BY_DATASET_FILE, $this->tissueTypesByDataset);
        self::writeJsonFile(Common::TRF_BY_DATASET_FILE, $this->tRFByDataset);
        self::writeJsonFile(Common::TRF_BY_TISSUE_TYPE_FILE, $this->tRFByTissueType);
        self::writeJsonFile(Common::TRF_BY_DATASET_AND_TISSUE_FILE, $this->tRFByDatasetAndTissue);
    }

    private function readList(): void
    {
        if (($handle = gzopen($this->inputFile, 'r')) !== false) {
            $data = fgetcsv($handle, 1000, "\t"); // SKIP FIRST LINE
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != 4) {
                    continue;
                }
                $dataset = trim($data[0]);
                $type = trim($data[1]);
                $tRF = trim($data[2]);
                $avg = doubleval(trim($data[3]));
                if (!isset($this->tRFByTissueType[$type])) {
                    $this->tRFByTissueType[$type] = [];
                    $this->tissueTypes[$type] = $type;
                }
                if (!isset($this->tRFByDataset[$dataset])) {
                    $this->tRFByDataset[$dataset] = [];
                    $this->tRFByDatasetAndTissue[$dataset] = [];
                    $this->datasets[$dataset] = $dataset;
                }
                if (!isset($this->tRFByDatasetAndTissue[$dataset][$type])) {
                    $this->tRFByDatasetAndTissue[$dataset][$type] = [];
                }
                if (!isset($this->tissueTypesByDataset[$dataset])) {
                    $this->tissueTypesByDataset[$dataset] = [];
                }
                $this->tRFByDataset[$dataset][$tRF] = min($avg, $this->tRFByDataset[$dataset][$tRF] ?? INF);
                $this->tRFByTissueType[$type][$tRF] = min($avg, $this->tRFByTissueType[$type][$tRF] ?? INF);
                $this->tRFByDatasetAndTissue[$dataset][$type][$tRF] = $avg;
                $this->tissueTypesByDataset[$dataset][$type] = $type;
            }
            gzclose($handle);
        } else {
            throw new RuntimeException("Unable to open tRF list file");
        }
    }

}
