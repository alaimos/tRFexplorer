<?php


namespace App\Data\Parser;


use App\Data\CachedReader;
use App\Data\Common;
use RuntimeException;

class tRFDataParser extends AbstractParser
{

    private $tRNAData = [];
    private $tRFData = [];

    /**
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    private function prepareTRNAData()
    {
        $anticodons = CachedReader::json(Common::TRF_BY_ANTICODON_FILE, 'local', true);
        foreach ($anticodons as $anticodon => $tRFs) {
            foreach ($tRFs as $tRF) {
                if (!isset($this->tRNAData[$tRF])) {
                    $this->tRNAData[$tRF] = [
                        'type'       => '',
                        'aminoacids' => [],
                        'anticodons' => [],
                    ];
                }
                $this->tRNAData[$tRF]['anticodons'][$anticodon] = $anticodon;
            }
        }
        $aminoacids = CachedReader::json(Common::TRF_BY_AMINOACID_FILE, 'local', true);
        foreach ($aminoacids as $aminoacid => $tRFs) {
            foreach ($tRFs as $tRF) {
                $this->tRNAData[$tRF]['aminoacids'][$aminoacid] = $aminoacid;
            }
        }
        $types = CachedReader::json(Common::TRF_BY_TYPE_FILE, 'local', true);
        foreach ($types as $type => $tRFs) {
            foreach ($tRFs as $tRF) {
                $this->tRNAData[$tRF]['type'] = $type;
            }
        }
    }

    /**
     * Run this parser
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    public function run(): void
    {
        $this->prepareTRNAData();
        $this->readList();
        self::writeJsonFile(Common::TRF_DATA_FILE, $this->tRFData);
    }

    /**
     * @param string $data
     *
     * @return array
     */
    private static function getDescriptionArray(string $data)
    {
        $matches = null;
        preg_match_all('/(\w+)\s+"([A-Za-z0-9\-\_]+)"/', $data, $matches, PREG_SET_ORDER);

        return array_column($matches, 2, 1);
    }

    private function readList(): void
    {
        if (($handle = fopen($this->inputFile, 'r')) !== false) {
            while (($data = fgetcsv($handle, 1000, "\t")) !== false) {
                $num = count($data);
                if ($num != 9) {
                    continue;
                }
                $description = self::getDescriptionArray($data[8]);
                if (!isset($this->tRFData[$description['gene_id']])) {
                    $this->tRFData[$description['gene_id']] = [
                        'id'          => $description['gene_id'],
                        'name'        => $description['gene_id'],
                        'type'        => $this->tRNAData[$description['gene_id']]['type'] ?? null,
                        'transcripts' => [],
                        'aminoacids'  => $this->tRNAData[$description['gene_id']]['aminoacids'] ?? [],
                        'anticodons'  => $this->tRNAData[$description['gene_id']]['anticodons'] ?? [],
                    ];
                }
                $this->tRFData[$description['gene_id']]['transcripts'][$description['transcript_id']] = [
                    'id'     => $description['transcript_id'],
                    'name'   => $description['transcript_id'],
                    'chr'    => $data[0],
                    'start'  => intval($data[3]),
                    'end'    => intval($data[4]),
                    'strand' => $data[6],
                ];
            }
            fclose($handle);
        } else {
            throw new RuntimeException("Unable to open tRF list file");
        }
    }

}
