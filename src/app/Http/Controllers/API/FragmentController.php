<?php

namespace App\Http\Controllers\API;

use Cache;
use Error;
use Exception;
use App\Data\Common;
use Illuminate\Support\Arr;
use Illuminate\Http\Request;
use App\Data\CachedReader;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Class FragmentController
 * @package App\Http\Controllers\API
 */
class FragmentController extends Controller
{

    /**
     * Show fragment data
     *
     * @param \Illuminate\Http\Request $request
     *
     * @param string                   $fragment
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request, string $fragment): JsonResponse
    {
        $error = false;
        $message = '';
        $data = null;
        try {
            $fragment = trim($fragment);
            $allFragments = CachedReader::json(Common::TRF_DATA_FILE);
            if (empty($fragment) || !isset($allFragments[$fragment])) {
                $error = true;
                $message = 'Unknown fragment id ' . $fragment;
            } else {
                $data = $allFragments[$fragment];
                $k = md5($fragment);
                $data['NCI60'] = [
                    'RPM' => CachedReader::json(sprintf(Common::NCI60_RPM_MATRIX, $k)) ?? [],
                    'TPM' => CachedReader::json(sprintf(Common::NCI60_TPM_MATRIX, $k)) ?? [],
                ];
                $data['TCGA'] = [
                    'RPM' => CachedReader::json(sprintf(Common::TCGA_RPM_MATRIX, $k)) ?? [],
                    'TPM' => CachedReader::json(sprintf(Common::TCGA_TPM_MATRIX, $k)) ?? [],
                ];
            }
        } catch (Exception $e) {
            $error = true;
            $message = 'Exception ' . get_class($e) . ': ' . $e->getMessage();
        } catch (Error $e) {
            $error = true;
            $message = 'Error ' . get_class($e) . ': ' . $e->getMessage();
        }

        return response()->json(
            [
                'error'   => $error,
                'message' => $message,
                'data'    => $data,
            ]
        );
    }
}
