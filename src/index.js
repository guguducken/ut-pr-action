const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require("@octokit/graphql");

// const accessToken = process.env['GITHUB_TOKEN'];
const accessToken = core.getInput('github-token');
// const accessToken = process.env['GITHUB_TOKEN'];


async function run() {
    try {

        const context = github.context;
        const pr = context.payload.pull_request;
        const num = pr.number       //获取PR的序号
        core.info(JSON.stringify(num));
        core.info(JSON.stringify(accessToken));

        //获取PR的paths
        const graphqlWithAuth = graphql.defaults({
            headers: {
                authorization: `token ` + accessToken,
            },
        });
        const { pr_paths } = await graphqlWithAuth(`
            {
                repository(name: "matrixone", owner: "matrixorigin") {
                    pullRequest(number: 4174) {
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
        `);
        core.info("---------------------------------------------------------");
        core.info(JSON.stringify(pr_paths));
        core.info("---------------------------------------------------------");
    } catch (err) {
        core.setFailed(err.message);
    }
}

run();