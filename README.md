# otherCharts

This repository is for work-in-progress, infrequently used, and retired chart templates i.e. *the garage*. 

> [!WARNING]
> This repository contains the latest version of the `lib` folder, and so chart templates that have been moved into the garage a while ago, may not work out of the box.

## Contributing

* Do not update the `lib` folder in this repository. If you want to make changes, please make a pull request at [github.com/ONSvisual/Charts](https://github.com/Charts). When merged, the changes to the `lib` folder will automatically be copied over.

## Transferring files and retaining history

Many of these template have been moved over from the [Charts](https://github.com/ONSvisual/Charts) repository. If you need to move something from the Charts repository into this one, use the following approach to make sure that any history is retained.

* Create a clean clone of `Charts` and `otherCharts` in the same folder.

In your local `Charts` repo:

* Move all of the repositories you want to move into a folder called `to-move`. 
* Stage and commit these changes to a new branch called e.g. `big-tidy`.
* In the terminal, run `git filter-branch –-subdirectory-filter to-move -- --all`
* You’ll get a warning, wait for it to go away. It will then start filter, which may take a while.
* It will look like you've retained only the folders you want to move. Don't worry!

When it’s finished, go to the local `otherCharts` repo:

* Add a local remote of the `Charts` repo by running `git remote add source-repo ../Charts`
* Then fetch the local remote by running `git fetch source-repo`
* Then create and check out a new branch with `git checkout -b moving-folders`
* Merge in the source repo with `git merge source-repo/big-tidy --allow-unrelated-histories`
* In your local `otherCharts` repo, tidy up by removing the local remote with `git remote rm source-repo`.
* Delete the branch with the copy of the source with `git branch -d source-repo`
* Check the `moving-folders` branch looks correct, push it to the remote `otherCharts` with `git push -u origin moving-folders`, and open a pull request.

Delete the clone of the `Charts` repo. Do not push these changes!

In a different, clean clone of `Charts`, open a pull request to delete the folders that you have moved.
