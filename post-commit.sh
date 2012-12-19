#!/bin/sh

# figure out our current branch 
CURRENTBRANCH=$(git branch | grep "*" | sed "s/* //")

# only run if we're on master
if [ $CURRENTBRANCH = master ]; then
  git checkout gh-pages
  git merge -s subtree master
  git checkout master
else
  echo "Hooks are only run on master branch"
fi
