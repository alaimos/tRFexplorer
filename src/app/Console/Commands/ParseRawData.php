<?php

namespace App\Console\Commands;

use App\Data\Common;
use App\Data\Parser\AbstractParser;
use App\Data\Parser\CorrelationTablesParser;
use App\Data\Parser\tRFAvgExpressionParser;
use App\Data\Parser\tRFClinicalDataParser;
use App\Data\Parser\tRFDataParser;
use App\Data\Parser\tRFDEClinicalDataParser;
use App\Data\Parser\tRFDEExpressionDataParser;
use App\Data\Parser\tRFExpressionDataParser;
use App\Data\Parser\tRFListParser;
use Cache;
use Exception;
use Illuminate\Console\Command;
use ReflectionClass;
use RuntimeException;

class ParseRawData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'data:parse';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Parse raw data and prepares json files';


    /**
     * A list of parsers
     *
     * @var array
     */
    private $parsers;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->init();
    }

    private function init()
    {
        $this->parsers = [
            [tRFListParser::class, [resource_path('data/tRF.list.tsv')]],
            [tRFAvgExpressionParser::class, [resource_path('data/tRF.avg_expressions.tsv')]],
            [tRFDataParser::class, [resource_path('data/tRNA.fragments.hg19.tsv')]],
            [tRFClinicalDataParser::class, [resource_path('data/NCI60_clinical.tsv'), Common::NCI60_CLINICAL]],
            [
                tRFExpressionDataParser::class,
                [resource_path('data/NCI60_RPM_matrix.tsv'), Common::NCI60_RPM_MATRIX, Common::NCI60_CLINICAL],
            ],
            [
                tRFExpressionDataParser::class,
                [resource_path('data/NCI60_TPM_matrix.tsv'), Common::NCI60_TPM_MATRIX, Common::NCI60_CLINICAL],
            ],
            [tRFClinicalDataParser::class, [resource_path('data/TCGA_clinical.tsv'), Common::TCGA_CLINICAL]],
            [
                tRFExpressionDataParser::class,
                [resource_path('data/TCGA_RPM_matrix.tsv'), Common::TCGA_RPM_MATRIX, Common::TCGA_CLINICAL],
            ],
            [
                tRFExpressionDataParser::class,
                [resource_path('data/TCGA_TPM_matrix.tsv'), Common::TCGA_TPM_MATRIX, Common::TCGA_CLINICAL],
            ],
            [tRFDEClinicalDataParser::class, [resource_path('data/TCGA_clinical_de.tsv')]],
            [
                tRFDEExpressionDataParser::class,
                [resource_path('data/TCGA_raw_counts_matrix.tsv'), resource_path('data/TCGA_clinical_de.tsv')],
            ],
            [
                CorrelationTablesParser::class,
                [resource_path('data/correlation_datasets_map.tsv')],
            ],
        ];
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        try {
            foreach ($this->parsers as $parser) {
                $this->info("Running {$parser[0]}");
                $class = new ReflectionClass($parser[0]);
                $instance = $class->newInstanceArgs($parser[1]);
                if (!$instance instanceof AbstractParser) {
                    throw new RuntimeException("Invalid parser class.");
                }
                $instance->run();
                $this->info("OK!");
            }
            $this->info("Flushing cache");
            Cache::flush();
            $this->info("OK!");
        } catch (Exception $e) {
            $this->error($e);
        }

        return 0;
    }
}
