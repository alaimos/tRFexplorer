<?php


namespace App\Data;


/**
 * Common definitions
 * @package App\Data
 */
class Common
{

    const TRF_LIST                       = 'data/tRF.list.json';
    const TRF_BY_TYPE_FILE               = 'data/tRF.byType.json';
    const TRF_BY_ANTICODON_FILE          = 'data/tRF.byAnticodon.json';
    const TRF_BY_AMINOACID_FILE          = 'data/tRF.byAminoacid.json';
    const TYPES_FILE                     = 'data/types.json';
    const ANTICODONS_FILE                = 'data/anticodon.json';
    const AMINOACIDS_FILE                = 'data/aminoacid.json';
    const ANTICODONS_BY_AMINOACID_FILE   = 'data/anticodons.byAminoacid.json';
    const TRF_BY_DATASET_FILE            = 'data/tRF.byDataset.json';
    const TRF_BY_TISSUE_TYPE_FILE        = 'data/tRF.byTissueType.json';
    const TRF_BY_DATASET_AND_TISSUE_FILE = 'data/tRF.byDatasetAndTissue.json';
    const TISSUE_TYPES_BY_DATASET_FILE   = 'data/tissueTypesByDataset.json';
    const TISSUE_TYPES_FILE              = 'data/tissueTypes.json';
    const DATASETS_FILE                  = 'data/datasets.json';
    const TRF_DATA_FILE                  = 'data/tRF.data.json';
    const NCI60_CLINICAL                 = 'data/NCI60.clinical.json';
    const NCI60_RPM_MATRIX               = 'data/NCI60/rpm/%s.json';
    const NCI60_TPM_MATRIX               = 'data/NCI60/tpm/%s.json';
    const TCGA_CLINICAL                  = 'data/TCGA.clinical.json';
    const TCGA_RPM_MATRIX                = 'data/TCGA/rpm/%s.json';
    const TCGA_TPM_MATRIX                = 'data/TCGA/tpm/%s.json';
    const TCGA_CLINICAL_DE_BY_DATASET    = 'data/TCGA.clinical.de.byDataset.json';
    const TCGA_CLINICAL_DE_FOLDER        = 'data/de/clinical';
    const TCGA_EXPRESSION_DE_FOLDER      = 'data/de/expression';
    const OUTPUT_BASE                    = 'public/output/%s/';
    const OUTPUT_URL_BASE                = 'storage/output/%s/coef-%d.html';
}
