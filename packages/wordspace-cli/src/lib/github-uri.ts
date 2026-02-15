export interface GitHubRef {
  owner: string;
  repo: string;
  path: string;
  branch: string;
}

/**
 * Parse a `github:owner/repo/path/file.prose[@branch]` URI.
 */
export function parseGitHubUri(uri: string): GitHubRef {
  const body = uri.replace(/^github:/, "");
  const [pathPart, branch = "main"] = body.split("@");
  const segments = pathPart.split("/");

  if (segments.length < 3) {
    throw new Error(
      `Invalid GitHub URI: "${uri}". Expected github:owner/repo/path[...@branch]`,
    );
  }

  const [owner, repo, ...rest] = segments;
  return { owner, repo, path: rest.join("/"), branch };
}

/** Build the raw.githubusercontent.com URL for a ref. */
export function toRawUrl(ref: GitHubRef): string {
  return `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${ref.branch}/${ref.path}`;
}

/** Extract the filename from the path (last segment). */
export function fileName(ref: GitHubRef): string {
  const parts = ref.path.split("/");
  return parts[parts.length - 1];
}
