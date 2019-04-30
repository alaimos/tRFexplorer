<?php


namespace App\Data\Parser;

use RuntimeException;
use Storage;

/**
 * Class AbstractParser
 *
 * @package App\Data\Parser
 */
abstract class AbstractParser
{

    /**
     * @var string
     */
    protected $inputFile;

    /**
     * Default parser constructor
     *
     * @param string $inputFile
     */
    public function __construct(string $inputFile)
    {
        if (!file_exists($inputFile)) {
            throw new RuntimeException("Input file does not exist");
        }
        $this->inputFile = $inputFile;
    }

    /**
     * Run this parser
     */
    public abstract function run(): void;

    /**
     * Write array to json file in the storage folder
     *
     * @param string $filename
     * @param array  $data
     */
    protected static function writeJsonFile(string $filename, array $data): void
    {
        Storage::disk('local')->put($filename, json_encode($data));
    }


}
