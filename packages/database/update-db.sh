#!/bin/sh

cd /srv/db
sqlite3 $VOPIDY_DB/vopidy.sqlite < ./schema.sql
