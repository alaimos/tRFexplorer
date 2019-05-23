#!/usr/bin/env Rscript
script.dir <- dirname((function() {
  cmdArgs <- commandArgs(trailingOnly = FALSE)
  needle <- "--file="
  match <- grep(needle, cmdArgs)
  if (length(match) > 0) {
    # Rscript
    return(normalizePath(sub(needle, "", cmdArgs[match])))
  } else {
    # 'source'd via R console
    return(normalizePath(sys.frames()[[1]]$ofile))
  }
})())
##########################################################################################################
# REQUIRED PACKAGES
##########################################################################################################
source.packages <- c("GlimmaTRF")
source.location <- c(paste0(script.dir, "/GlimmaTRF_0.0.0.tar.gz"))
packages        <- c("getopt", "edgeR", "limma", "ggplot2", "rjson")
##########################################################################################################
source(paste0(script.dir, "/setup.R"))
##########################################################################################################

# opt <- readRDS("../../storage/app/public/output/9fbc72310da0e390a651b830a7e1b7e1/input.rds")
# #cb51cb50a372a44b745910a02099d830/input.rds")
# get options, using the spec as defined by the enclosed list.
# we read the options from the default: commandArgs(TRUE).
spec <- matrix(c(
  'help',            'h', 0, "logical",
  'input.data',      'd', 1, "character",
  'input.clinical',  'c', 1, "character",
  'config.analysis', 'a', 1, "character",
  'output.folder',   'o', 1, "character"
), byrow=TRUE, ncol=4)
opt = getopt(spec)
# if help was asked for print a friendly message
# and exit with a non-zero error code
if (!is.null(opt$help)) {
  cat(getopt(spec, usage=TRUE))
  q(status=1)
}

if (is.null(opt$input.data) || !file.exists(opt$input.data)) {
  cat(getopt(spec, usage=TRUE))
  q(status=101)
}

if (is.null(opt$input.clinical) || !file.exists(opt$input.clinical)) {
  cat(getopt(spec, usage=TRUE))
  q(status=102)
}

if (is.null(opt$config.analysis) || !file.exists(opt$config.analysis)) {
  cat(getopt(spec, usage=TRUE))
  q(status=103)
}

if (is.null(opt$output.folder) || !dir.exists(opt$output.folder)) {
  cat(getopt(spec, usage=TRUE))
  q(status=104)
}

tryCatch({
  input.data           <- read.table(opt$input.data, header = TRUE, sep = "\t", row.names = 1, 
                                     check.names = FALSE, stringsAsFactors = FALSE)
  input.data           <- data.matrix(input.data)
  input.clinical       <- read.table(opt$input.clinical, header = TRUE, sep = "\t", row.names = 1, 
                                     stringsAsFactors = FALSE)
  config.analysis      <- fromJSON(file = opt$config.analysis)
  variables            <- make.names(config.analysis$variables)
  input.clinical$CLASS <- factor(make.names(unname(apply(input.clinical[,variables, drop=FALSE] , 1 , paste , collapse = " "))))
  maxP                 <- config.analysis$maxP
  minLFC               <- config.analysis$minLFC
  algorithm            <- config.analysis$algorithm
  omit                 <- which(apply(sapply(variables, function (x) (is.na(input.clinical[[x]]))), 1, function (x) (any(x))))
  if (length(omit) > 0) {
    input.clinical <- input.clinical[-omit,]
  }
  input.clinical$CLASS <- factor(as.vector(input.clinical$CLASS))
  contrasts            <- sapply(config.analysis$contrasts, function (x) {
    return (
      paste(
        paste0("(", paste0(make.names(x$case), collapse = "+"), ")"), 
        paste0("(", paste0(make.names(x$control), collapse = "+"), ")"), 
        sep=" - ")
    )
  })
  
  input.data <- do.call(cbind, tapply(1:ncol(input.data), colnames(input.data), 
                                      function (x) (round(rowMeans(input.data[,x, drop=FALSE])))))
  common <- intersect(rownames(input.clinical), colnames(input.data))
  input.clinical <- input.clinical[common,]
  input.data     <- input.data[, common]
  
  design <- model.matrix(~ 0 + CLASS, data = input.clinical)
  colnames(design) <- levels(input.clinical$CLASS)
  dge    <- DGEList(counts=input.data)
  keep   <- filterByExpr(dge, design)
  dge    <- dge[keep,,keep.lib.sizes=FALSE]
  dge    <- calcNormFactors(dge)
  v.dge  <- voom(dge, design, plot=FALSE)
  contrasts <- makeContrasts(contrasts = contrasts, levels = design)
  fit    <- lmFit(v.dge, design)
  fit.2  <- eBayes(contrasts.fit(fit, contrasts))
  dt     <- decideTests(fit.2, p.value=maxP,lfc = minLFC)
  for (COEF in 1:ncol(contrasts)) {
    suppressWarnings({
      chosen.samples <- input.clinical$CLASS %in% names(which(contrasts[,COEF] != 0))
      chosen.classes <- factor(as.vector(input.clinical$CLASS[chosen.samples]))
      colors         <- setNames(topo.colors(length(levels(chosen.classes))), levels(chosen.classes))
      cols           <- colors[chosen.classes]
      chosen.data    <- v.dge$E[,rownames(input.clinical)[chosen.samples]]
      glVolcanoPlot(fit.2, status=dt, coef=COEF, counts=chosen.data, groups=chosen.classes, 
                    path = opt$output.folder, folder = "plots", html = paste0("coef-", COEF), 
                    sample.cols = cols, transform = FALSE, launch = FALSE)
    })
    saveRDS(opt, file = paste0(opt$output.folder, "/input.rds"))
    de.table <- topTable(fit.2, coef = COEF, number = Inf, p.value = maxP, lfc = minLFC)
    write.table(de.table, file = paste0(opt$output.folder,"/de.coef-", COEF,".tsv"), append = FALSE, sep = "\t", 
                dec = ".", quote = FALSE, row.names = TRUE, col.names = TRUE)
  }
  write.table(dt, file = paste0(opt$output.folder,"/de.status.tsv"), append = FALSE, sep = "\t", dec = ".", 
              quote = FALSE, row.names = TRUE, col.names = TRUE)  
}, error=function (e) {
  cat(e$message);
  q(status = 105)
})
q(status=0)
