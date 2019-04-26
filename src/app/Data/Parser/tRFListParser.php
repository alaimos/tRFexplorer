<?php


namespace App\Data\Parser;


class tRFListParser
{

    const TRF_BY_TYPE_FILE = 'tRF.byType.json';
    const TRF_BY_ANTICODON_FILE = 'tRF.byAnticodon.json';
    const TRF_BY_AMINOACID_FILE = 'tRF.byAminoacid.json';
    const TYPES_FILE = 'tRF.types.json';
    const ANTICODONS_FILE = 'tRF.anticodon.json';
    const AMINOACIDS_FILE = 'tRF.aminoacid.json';
    const ANTICODONS_BY_AMINOACID_FILE = 'anticodons.byAminoacid.json';

    private $tRFByType              = [];
    private $tRFByAnticodon         = [];
    private $tRFByAminoacid         = [];
    private $types                  = [];
    private $anticodons             = [];
    private $aminoacids             = [];
    private $anticodonsByAminoacids = [];

    private $inputFile;
    private $outputDirectory;

    /**
     * tRFListParser constructor.
     * @param string $inputFile
     * @param string $outputDirectory
     */
    public function __construct(string $inputFile, string $outputDirectory)
    {
        if (!file_exists($inputFile)) {
            throw new \RuntimeException("Input file does not exist");
        }
        if (!file_exists($outputDirectory)) {
            @mkdir($outputDirectory, 0777, true);
            if (!file_exists($outputDirectory)) {
                throw new \RuntimeException("Output directory does not exist");
            }
        }
        $this->inputFile       = $inputFile;
        $this->outputDirectory = $outputDirectory;
    }

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readList();
        self::writeJsonFile($this->outputDirectory . '/' . self::TRF_BY_TYPE_FILE, $this->tRFByType);
        self::writeJsonFile($this->outputDirectory . '/' . self::TRF_BY_ANTICODON_FILE, $this->tRFByAnticodon);
        self::writeJsonFile($this->outputDirectory . '/' . self::TRF_BY_AMINOACID_FILE, $this->tRFByAminoacid);
        self::writeJsonFile($this->outputDirectory . '/' . self::TYPES_FILE, $this->types);
        self::writeJsonFile($this->outputDirectory . '/' . self::ANTICODONS_FILE, $this->anticodons);
        self::writeJsonFile($this->outputDirectory . '/' . self::AMINOACIDS_FILE, $this->aminoacids);
        self::writeJsonFile($this->outputDirectory . '/' . self::ANTICODONS_BY_AMINOACID_FILE, $this->anticodonsByAminoacids);
    }

    private function readList(): void
    {
        if (($handle = fopen($this->inputFile, 'r')) !== false) {
            $data = fgetcsv($handle, 1000, "\t"); // SKIP FIRST LINE
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != 4) continue;
                $tRF       = trim($data[0]);
                $type      = trim($data[1]);
                $anticodon = trim($data[2]);
                $aminoacid = trim($data[3]);
                if (!isset($this->tRFByType[$type])) {
                    $this->tRFByType[$type] = [];
                    $this->types[$type]     = $type;
                }
                if (!isset($this->tRFByAnticodon[$anticodon])) {
                    $this->tRFByAnticodon[$anticodon] = [];
                    $this->anticodons[$anticodon]     = $anticodon;
                }
                if (!isset($this->anticodonsByAminoacids[$aminoacid])) {
                    $this->anticodonsByAminoacids[$aminoacid] = [];
                }
                if (!isset($this->tRFByAminoacid[$aminoacid])) {
                    $this->tRFByAminoacid[$aminoacid] = [];
                    $this->aminoacids[$aminoacid]     = $aminoacid;
                }
                $this->tRFByType[$type][$tRF]                         = $tRF;
                $this->tRFByAnticodon[$anticodon][$tRF]               = $tRF;
                $this->tRFByAminoacid[$aminoacid][$tRF]               = $tRF;
                $this->anticodonsByAminoacids[$aminoacid][$anticodon] = $anticodon;
            }
            fclose($handle);
        } else {
            throw new \RuntimeException("Unable to open tRF list file");
        }
    }

    private static function writeJsonFile(string $filename, array $data): void
    {
        if (($handle = fopen($filename, 'w')) !== false) {
            fwrite($handle, json_encode($data));
            fclose($handle);
        } else {
            throw new \RuntimeException("Unable to write " . $filename);
        }
    }


}
