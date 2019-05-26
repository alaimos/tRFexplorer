<?php


namespace App\Data\Parser;


use App\Data\CachedReader;
use RuntimeException;

class tRFClinicalDataParser extends AbstractParser
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
     * tRFExpressionDataParser constructor.
     *
     * @param string $inputFile
     * @param string $outputFile
     */
    public function __construct(string $inputFile, string $outputFile)
    {
        parent::__construct($inputFile);
        $this->outputFile = $outputFile;
    }

    /**
     * Run this parser
     */
    public function run(): void
    {
        $this->readData();
        self::writeJsonFile($this->outputFile, $this->data);
    }

    private function readData(): void
    {
        if (($handle = gzopen($this->inputFile, 'r')) !== false) {
            $variables = fgetcsv($handle, 0, "\t");
            foreach ($variables as $v) {
                $this->data[$v] = [];
            }
            $rowSize = count($variables);
            while (($data = fgetcsv($handle, 0, "\t")) !== false) {
                $num = count($data);
                if ($num != $rowSize) {
                    continue;
                }
                for ($i = 0; $i < $num; $i++) {
                    $this->data[$variables[$i]][] = self::handleNA($data[$i], null);
                }
            }
            gzclose($handle);
        } else {
            throw new RuntimeException("Unable to open clinical data file");
        }
    }

}
