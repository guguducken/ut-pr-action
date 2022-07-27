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
        const pr_paths = await graphqlWithAuth(
            `
            {
                repository(name: $name, owner: $repo_owner) {
                    pullRequest(number: $id_pr) {
                        files(first: 100) {
                            edges {
                                node {
                                    path
                                }
                            }
                        }
                    }
                }
            }
        `, {
            name: repo,
            repo_owner: owner,
            id_pr: num,

        });
        core.info("---------------------------------------------------------");
        core.info(JSON.stringify(pr_paths));
        core.info("---------------------------------------------------------");
    } catch (err) {
        core.setFailed(err.message);
    }
}

run();