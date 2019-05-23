##########################################################################################################
# R AutoDepInstaller 0.0.2
# Developed by S. Alaimo (alaimos at dmi dot unict dot it)
##########################################################################################################
if (!requireNamespace("BiocManager", quietly = TRUE))
  install.packages("BiocManager")
##########################################################################################################
not.installed <- setdiff(packages, rownames(installed.packages()))
if (length(not.installed) > 0) {
  suppressMessages(suppressWarnings(try({
    BiocManager::install(not.installed, dependencies=TRUE)
  }, silent=TRUE)))
}
not.installed <- setdiff(packages, rownames(installed.packages()))
if (length(not.installed) > 0) {
  stop(paste0("Unable to install required packages: ", paste(not.installed, collapse=", "))) 
}
##########################################################################################################
not.installed <- setdiff(source.packages, rownames(installed.packages()))
if (length(not.installed) > 0) {
  for (i in 1:length(source.packages)) {
    if (source.packages[i] %in% not.installed) {
      install.packages(source.location[i], repos=NULL, type="source")
    }
  }
  rm(i)
}
not.installed <- setdiff(source.packages, rownames(installed.packages()))
if (length(not.installed) > 0) {
  stop(paste0("Unable to install required packages: ", paste(not.installed, collapse=", "))) 
}
##########################################################################################################
for (p in c(source.packages, packages)) {
  suppressMessages(
    suppressPackageStartupMessages(
      library(package=p, character.only=TRUE, quietly=TRUE, verbose=FALSE)))
}
rm(p, not.installed, packages, source.location, source.packages)