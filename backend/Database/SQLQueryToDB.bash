#!/bin/bash
#psql -h localhost -U wastecollectiondata -p 5432 -a -q -f $abs_path/setupDB.sql
psql "dbname='$1' user='$2' password='$3' host='$4' port='$5'" -a -q -f $6
