#!/bin/sh

# figure out our current branch 
CURRENTBRANCH=$(git branch | grep "*" | sed "s/* //")

# only run if we're on master
if [ $CURRENTBRANCH = master ]; then
  ./node_modules/.bin/grunt
  git add public
else
  echo "Hooks are only run on master branch"
fi
