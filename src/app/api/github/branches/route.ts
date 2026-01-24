import { Octokit } from "octokit"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const repoFull = searchParams.get("repo")

  if (!repoFull) {
    return new Response(JSON.stringify({ error: "Repository is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const [owner, repo] = repoFull.split("/")

  if (!owner || !repo) {
    return new Response(JSON.stringify({ error: "Invalid repository format. Expected 'owner/repo'" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const token = (process.env.GITHUB_PAT || "").trim()

  console.log(`[GitHub API] Requesting branches: ${owner}/${repo}`, {
    tokenPresent: !!token,
    tokenLength: token.length,
    tokenPrefix: token ? token.substring(0, 10) + "..." : "none"
  })

  try {
    const octokit = new Octokit({
      auth: token,
    })

    const response = await octokit.request("GET /repos/{owner}/{repo}/branches", {
      owner,
      repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        "accept": "application/vnd.github+json",
      },
    })

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error(`[GitHub API] Branches Error:`, {
      status: error.status,
      message: error.message,
      documentation_url: error.response?.data?.documentation_url
    })

    const errorMessage = error.status === 404
      ? "Repository not found. For private repos, ensure your GITHUB_PAT has 'repo' scope."
      : error.message

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error.status || 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

