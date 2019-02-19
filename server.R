#install.packages("plumber")
setwd("D:/Utilisateurs/Valentin/Bureau/pi2")
pr <- plumber::plumb("api.R")
pr$run()
