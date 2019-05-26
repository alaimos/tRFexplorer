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
source.packages <- c()
source.location <- c()
packages        <- c("getopt", "ggplot2", "rjson", "ggpubr", "plotly", "htmlwidgets")
##########################################################################################################
source(paste0(script.dir, "/setup.R"))
##########################################################################################################

# get options, using the spec as defined by the enclosed list.
# we read the options from the default: commandArgs(TRUE).
spec <- matrix(c(
  'help',         'h', 0, "logical",
  'row.id',       'r', 1, "character",
  'col.id',       'c', 1, "character",
  'dataset.file', 'd', 1, "character",
  'trf.file',     't', 1, "character",
  'cor.method',   'm', 1, "character",
  'output.file',  'o', 1, "character"
), byrow=TRUE, ncol=4)
opt = getopt(spec)
# if help was asked for print a friendly message
# and exit with a non-zero error code
if (!is.null(opt$help)) {
  cat(getopt(spec, usage=TRUE))
  q(status=1)
}

if (is.null(opt$dataset.file) || !file.exists(opt$dataset.file)) {
  cat(getopt(spec, usage=TRUE))
  q(status=101)
}

if (is.null(opt$trf.file) || !file.exists(opt$trf.file)) {
  cat(getopt(spec, usage=TRUE))
  q(status=102)
}

if (is.null(opt$row.id)) {
  cat(getopt(spec, usage=TRUE))
  q(status=103)
}

if (is.null(opt$col.id)) {
  cat(getopt(spec, usage=TRUE))
  q(status=104)
}

if (is.null(opt$cor.method)) {
  opt$cor.method <- "pearson"
}

tryCatch({
  saveRDS(opt, file = "/home/alaimos/repos/tRFexplorer/src/storage/app/input.rds")
  tmp     <- readRDS(opt$dataset.file)
  if (is.list(tmp) && !is.matrix(tmp)) {
    dataset <- tmp$x
    trf     <- list(RPM=tmp$y, clinical=tmp$clicinal)
  } else {
    dataset <- tmp
    trf     <- readRDS(opt$trf.file)
  }
  x       <- as.vector(dataset[opt$row.id,])
  y       <- as.vector(t(trf$RPM[opt$col.id,]))
  color   <- factor(trf$clinical[colnames(trf$RPM),]$tissue)
  texts   <- paste0(opt$row.id, ": <b>", format(x, digits = 4), "</b><br />", 
                    opt$col.id, ": <b>", format(y, digits = 4), "</b><br />",
                    "Tissue: <b>", color, "</b>")
  df      <- data.frame(x=x, y=y, Tissue=color, text=texts, row.names = colnames(trf$RPM))
  ct      <- cor.test(x=df$x, y=df$y, method = opt$cor.method)
  suppressWarnings({
    sp      <- ggplot(data = df, aes(x=x, y=y)) +
               geom_point(aes(text = text, color=Tissue)) + 
               geom_smooth(method='lm') +
               xlab(opt$row.id) +
               ylab(opt$col.id) +
               ggtitle(paste0("R = ", format(unname(ct$estimate), digits = 4)," , p = ", format(ct$p.value, digits = 4)))
    pp <- ggplotly(sp, tooltip = c("text"))
    saveWidget(as_widget(pp), file = opt$output.file, selfcontained = FALSE, 
               libdir = paste0(dirname(opt$output.file), "/libs"),
               title = paste0(opt$row.id, " vs ", opt$col.id))
  })
  # sp      <- ggscatter(df, x = "x", y = "y", color = "Tissue",
  #                      add = "reg.line",
  #                      add.params = list(color = "blue", fill = "lightgray"),
  #                      xlab = opt$row.id, ylab = opt$col.id,
  #                      conf.int = FALSE, cor.coef = FALSE, cor.method = opt$cor.method,
  #                      cor.coeff.args = list(output.type="text"),
  #                      main = paste0("R = ", format(unname(ct$estimate), digits = 4)," , p = ", format(ct$p.value, digits = 4)))
  # ggsave(opt$output.file, plot = sp, width = 20, height = 20, units = "cm", dpi = 600)
}, error=function (e) {
  cat(e$message);
  q(status = 105)
})
q(status=0)
