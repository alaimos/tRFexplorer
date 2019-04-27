<?php

namespace App\Http\Controllers\API;

use App\Data\CachedJSONReader;
use App\Data\Common;
use Cache;
use Error;
use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Arr;

class BrowseByExpression extends Controller
{

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function formData()
    {
        $error   = false;
        $message = '';
        $data    = null;
        try {
            $data = [
                'types'                 => CachedJSONReader::read(Common::TYPES_FILE),
                'aminoacids'            => CachedJSONReader::read(Common::AMINOACIDS_FILE),
                'anticodonsByAminoacid' => CachedJSONReader::read(Common::ANTICODONS_BY_AMINOACID_FILE),
                'datasets'              => CachedJSONReader::read(Common::DATASETS_FILE),
                'tissueTypesByDataset'  => CachedJSONReader::read(Common::TISSUE_TYPES_BY_DATASET_FILE),
            ];
        } catch (Exception $e) {
            $error   = true;
            $message = "Exception " . get_class($e) . ": " . $e->getMessage();
        } catch (Error $e) {
            $error   = true;
            $message = "Error " . get_class($e) . ": " . $e->getMessage();
        }
        return response()->json([
                                    'error'   => $error,
                                    'message' => $message,
                                    'data'    => $data,
                                ]);
    }

    /**
     * Filter tRF list using user selection
     *
     * @param array $list
     * @param string $mapFile
     * @param array $selection
     * @return array
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    private function filterList(array $list, string $mapFile, array $selection): array
    {
        $all    = CachedJSONReader::read($mapFile);
        $result = array_intersect($list, array_unique(Arr::flatten(array_map(function ($x) use (&$all) {
            return array_values($all[$x]) ?? [];
        }, $selection))));
        return $result;
    }

    /**
     * Filter tRF list using user selection of dataset, tissues and min RPM value
     *
     * @param array $list
     * @param array $datasets
     * @param array $tissues
     * @param float $value
     * @return array
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    private function filterListByDatasetTissueAndValue(array $list, array $datasets, array $tissues, float $value): array
    {
        $key = "browse-by-expression-" . md5(implode(",", $datasets) . "-" . implode("-", $tissues) . "-" . $value);
        if (Cache::has($key)) {
            $selected = Cache::get($key);
        } else {
            $all         = CachedJSONReader::read(Common::TRF_BY_DATASET_AND_TISSUE_FILE);
            $allDatasets = empty($datasets);
            $allTissues  = empty($tissues);
            $selected    = [];
            foreach ($all as $dataset => $tissueData) {
                if ($allDatasets || in_array($dataset, $datasets)) {
                    foreach ($tissueData as $tissue => $fragments) {
                        if ($allTissues || in_array($tissue, $tissues)) {
                            foreach ($fragments as $fragment => $RPM) {
                                if ($RPM >= $value) $selected[] = $fragment;
                            }
                        }
                    }
                }
            }
            $selected = array_unique($selected);
            Cache::put($key, $selected, 6000);
        }
        return array_intersect($list, $selected);
    }

    /**
     * @param array $tRFList
     * @return array
     * @throws \Illuminate\Contracts\Filesystem\FileNotFoundException
     */
    private function formatTable(array $tRFList): array
    {
        $tRFList = array_unique($tRFList);
        $key     = "tRF-table-" . md5(implode(",", $tRFList));
        if (Cache::has($key)) {
            return Cache::get($key);
        } else {
            $table = [];
            $data  = CachedJSONReader::read(Common::TRF_DATA_FILE);
            foreach ($tRFList as $tRF) {
                if (isset($data[$tRF])) {
                    $table[] = [
                        'id'         => $data[$tRF]['id'],
                        'name'       => $data[$tRF]['name'],
                        'type'       => $data[$tRF]['type'],
                        'aminoacids' => array_values($data[$tRF]['aminoacids']),
                        'anticodons' => array_values($data[$tRF]['anticodons']),
                    ];
                }
            }
            Cache::put($key, $table, 6000);
            return $table;
        }
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $error   = false;
        $message = '';
        $data    = null;
        try {
            $tRFList    = CachedJSONReader::read(Common::TRF_LIST);
            $tRFType    = trim($request->get('tRFType', ''));
            $minRPM     = floatval(trim($request->get('minRPM', '1')));
            $aminoacids = array_filter(array_map("trim", (array)$request->get('aminoacids', [])));
            $anticodons = array_filter(array_map("trim", (array)$request->get('anticodons', [])));
            $dataset    = array_filter(array_map("trim", (array)$request->get('dataset', [])));
            $tissueType = array_filter(array_map("trim", (array)$request->get('tissueType', [])));
            if (!empty($tRFType)) {
                $tRFList = $this->filterList($tRFList, Common::TRF_BY_TYPE_FILE, [$tRFType]);
            }
            if (!empty($aminoacids)) {
                $tRFList = $this->filterList($tRFList, Common::TRF_BY_AMINOACID_FILE, $aminoacids);
            }
            if (!empty($anticodons)) {
                $tRFList = $this->filterList($tRFList, Common::TRF_BY_ANTICODON_FILE, $anticodons);
            }
            $tRFList = array_values($this->filterListByDatasetTissueAndValue($tRFList, $dataset, $tissueType, $minRPM));
            $data    = $this->formatTable($tRFList);
        } catch (Exception $e) {
            $error   = true;
            $message = "Exception " . get_class($e) . ": " . $e->getMessage();
        } catch (Error $e) {
            $error   = true;
            $message = "Error " . get_class($e) . ": " . $e->getMessage();
        }
        return response()->json([
                                    'error'   => $error,
                                    'message' => $message,
                                    'data'    => $data,
                                ]);
    }

    public function types()
    {
        $error   = false;
        $message = '';
        $data    = null;
        try {
            $data = CachedJSONReader::read(Common::TYPES_FILE);
        } catch (Exception $e) {
            $error   = true;
            $message = "Exception " . get_class($e) . ": " . $e->getMessage();
        } catch (Error $e) {
            $error   = true;
            $message = "Error " . get_class($e) . ": " . $e->getMessage();
        }
        return response()->json([
                                    'error'   => $error,
                                    'message' => $message,
                                    'data'    => $data,
                                ]);
    }

}
