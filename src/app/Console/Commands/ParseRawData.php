<?php

namespace App\Console\Commands;

use App\Data\Parser\tRFAvgExpressionParser;
use App\Data\Parser\tRFDataParser;
use App\Data\Parser\tRFListParser;
use Cache;
use Illuminate\Console\Command;

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
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        try {
            $this->info("Preparing tRF list files");
            (new tRFListParser(resource_path('data/tRF.list.tsv')))->run();
            $this->info("OK!");
            $this->info("Preparing tRF average expressions files");
            (new tRFAvgExpressionParser(resource_path('data/tRF.avg_expressions.tsv')))->run();
            $this->info("OK!");
            $this->info("Preparing tRF descriptions");
            (new tRFDataParser(resource_path('data/tRNA.fragments.hg19.tsv')))->run();
            $this->info("OK!");
            $this->info("Flushing cache");
            Cache::flush();
            $this->info("OK!");
        } catch (\Exception $e) {
            $this->error($e);
        }
        return 0;
    }
}
