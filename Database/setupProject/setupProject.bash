#!/bin/bash
rel_path="`dirname \"$0\"`"
abs_path="$PWD/$rel_path"
psql -h localhost -U wastecollectiondata -p 5432 -a -q -f $abs_path/$1 # $1 is the name of the sql-files (setupProjectXXX.sql)
