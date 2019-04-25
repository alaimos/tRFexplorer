<?php

namespace App\Http\Controllers\API;

use App\Data\CachedJSONReader;
use Error;
use Exception;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class BrowseByExpression extends Controller
{

    public function formData()
    {
        $error   = false;
        $message = '';
        $data = null;
        try {
            $data = [
                'types' => CachedJSONReader::read('data/tRF.types.json'),
                'anticodons' => CachedJSONReader::read('data/tRF.anticodon.json'),
                'aminoacids' => CachedJSONReader::read('data/tRF.aminoacid.json'),
            ];
        } catch (Exception $e) {
            $error   = true;
            $message = $e->getMessage();
        } catch (Error $e) {
            $error   = true;
            $message = $e->getMessage();
        }
        return response()->json([
            'error' => $error,
            'message' => $message,
            'data' => $data,
        ]);
    }

}
