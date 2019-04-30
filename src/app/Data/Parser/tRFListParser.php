<?php


namespace App\Data\Parser;


use App\Data\Common;
use RuntimeException;

class tRFListParser extends AbstractParser
{

    private $tRFsList = [];
    private $tRFByType = [];
    private $tRFByAnticodon = [];
    private $tRFByAminoacid = [];
    private $types = [];
    private $anticodons = [];
    private $aminoacids = [];
    private $anticodonsByAminoacids = [];

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readList();
        self::writeJsonFile(Common::TRF_LIST, array_values($this->tRFsList));
        self::writeJsonFile(Common::TRF_BY_TYPE_FILE, $this->tRFByType);
        self::writeJsonFile(Common::TRF_BY_ANTICODON_FILE, $this->tRFByAnticodon);
        self::writeJsonFile(Common::TRF_BY_AMINOACID_FILE, $this->tRFByAminoacid);
        self::writeJsonFile(Common::TYPES_FILE, $this->types);
        self::writeJsonFile(Common::ANTICODONS_FILE, $this->anticodons);
        self::writeJsonFile(Common::AMINOACIDS_FILE, $this->aminoacids);
        self::writeJsonFile(Common::ANTICODONS_BY_AMINOACID_FILE, $this->anticodonsByAminoacids);
    }

    private function readList(): void
    {
        if (($handle = fopen($this->inputFile, 'r')) !== false) {
            $data = fgetcsv($handle, 1000, "\t"); // SKIP FIRST LINE
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != 4) {
                    continue;
                }
                $tRF = trim($data[0]);
                $type = trim($data[1]);
                $anticodon = trim($data[2]);
                $aminoacid = trim($data[3]);
                if (!isset($this->tRFByType[$type])) {
                    $this->tRFByType[$type] = [];
                    $this->types[$type] = $type;
                }
                if (!isset($this->tRFByAnticodon[$anticodon])) {
                    $this->tRFByAnticodon[$anticodon] = [];
                    $this->anticodons[$anticodon] = $anticodon;
                }
                if (!isset($this->anticodonsByAminoacids[$aminoacid])) {
                    $this->anticodonsByAminoacids[$aminoacid] = [];
                }
                if (!isset($this->tRFByAminoacid[$aminoacid])) {
                    $this->tRFByAminoacid[$aminoacid] = [];
                    $this->aminoacids[$aminoacid] = $aminoacid;
                }
                $this->tRFsList[$tRF] = $tRF;
                $this->tRFByType[$type][$tRF] = $tRF;
                $this->tRFByAnticodon[$anticodon][$tRF] = $tRF;
                $this->tRFByAminoacid[$aminoacid][$tRF] = $tRF;
                $this->anticodonsByAminoacids[$aminoacid][$anticodon] = $anticodon;
            }
            fclose($handle);
        } else {
            throw new RuntimeException("Unable to open tRF list file");
        }
    }

}
