const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require("@octokit/graphql");

const accessToken = core.getInput('github-token');
// const accessToken = process.env['GITHUB_TOKEN'];


async function run() {
    try {

        const context = github.context;
        const num = context.payload?.pull_request?.number; //获取PR的序号
        const owner = context.repo.owner;
        const repo = context.repo.repo;
        core.info("---------------------------------------------------------");
        core.info(`The repository name is: ` + repo);
        core.info(`The owner of this repository is: ` + owner);

        if (num == undefined) {
            core.info(`This is no workflow with PR create`)
            core.info("---------------------------------------------------------");
            return
        }
        core.info(`The target pull request id is: ` + num);
        core.info("---------------------------------------------------------");

        //获取PR的paths
        const graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `bearer ` + accessToken,
            },
        });
        var pr_paths = await graphqlWithAuth(
            `
            query prPaths($owner_name: String!, $repo_name: String!,$id_pr: Int!, $lnum: Int = 100){
                repository(name: $repo_name, owner: $owner_name) {
                    pullRequest(number: $id_pr) {
                        files(first: $lnum) {
                            edges {
                                node {
                                    path
                                }
                            }
                        }
                    }
                }
            }
        `,
            {
                repo_name: repo,
                owner_name: owner,
                id_pr: num,

            });
        pr_paths = String(pr_paths);

        //使用正则表达式提取paths
        const re = /"path":"(.+)"/igm;
        var ans = pr_paths.match()
        if (ans == null) {
            core.info("No files changed")
        }
        core.info("---------------------------------------------------------");
        core.info(ans);
        core.info("---------------------------------------------------------");
    } catch (err) {
        core.setFailed(err.message);
    }
}

run();