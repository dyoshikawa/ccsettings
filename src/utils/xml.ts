import type { GitHubEventUnion } from "../types/index.js";

export class XmlGenerator {
  generate(events: GitHubEventUnion[], order: "asc" | "desc"): string {
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === "asc" ? dateA - dateB : dateB - dateA;
    });

    const xmlElements = sortedEvents.map((event) => this.eventToXml(event));

    return `<?xml version="1.0" encoding="UTF-8"?>
<GitHubEvents>
${xmlElements.join("\n")}
</GitHubEvents>`;
  }

  private eventToXml(event: GitHubEventUnion): string {
    switch (event.type) {
      case "Issue":
        return this.issueToXml(event);
      case "IssueComment":
        return this.issueCommentToXml(event);
      case "Discussion":
        return this.discussionToXml(event);
      case "DiscussionComment":
        return this.discussionCommentToXml(event);
      case "PullRequest":
        return this.pullRequestToXml(event);
      case "PullRequestReview":
        return this.pullRequestReviewToXml(event);
      case "Commit":
        return this.commitToXml(event);
      default:
        return "";
    }
  }

  private issueToXml(issue: GitHubEventUnion): string {
    if (issue.type !== "Issue") return "";
    const labels =
      issue.labels
        ?.map(
          (label: { name: string; color: string }) =>
            `    <Label name="${this.escapeXml(label.name)}" color="${this.escapeXml(label.color)}" />`,
        )
        .join("\n") || "";

    return `  <Issue createdAt="${issue.createdAt}" number="${issue.number}" state="${issue.state}">
    <Title>${this.escapeXml(issue.title || "")}</Title>
    <Body>${this.escapeXml(issue.body || "")}</Body>
    <Url>${this.escapeXml(issue.url || "")}</Url>
    <Repository>
      <Name>${this.escapeXml(issue.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(issue.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(issue.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(issue.author?.login || "")}</Login>
      <Url>${this.escapeXml(issue.author?.url || "")}</Url>
    </Author>
    <Labels>
${labels}
    </Labels>
  </Issue>`;
  }

  private issueCommentToXml(comment: GitHubEventUnion): string {
    if (comment.type !== "IssueComment") return "";
    return `  <IssueComment createdAt="${comment.createdAt}">
    <Body>${this.escapeXml(comment.body || "")}</Body>
    <Url>${this.escapeXml(comment.url || "")}</Url>
    <Issue>
      <Number>${comment.issue?.number || 0}</Number>
      <Title>${this.escapeXml(comment.issue?.title || "")}</Title>
      <Url>${this.escapeXml(comment.issue?.url || "")}</Url>
    </Issue>
    <Repository>
      <Name>${this.escapeXml(comment.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(comment.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(comment.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(comment.author?.login || "")}</Login>
      <Url>${this.escapeXml(comment.author?.url || "")}</Url>
    </Author>
  </IssueComment>`;
  }

  private discussionToXml(discussion: GitHubEventUnion): string {
    if (discussion.type !== "Discussion") return "";
    return `  <Discussion createdAt="${discussion.createdAt}">
    <Title>${this.escapeXml(discussion.title || "")}</Title>
    <Body>${this.escapeXml(discussion.body || "")}</Body>
    <Url>${this.escapeXml(discussion.url || "")}</Url>
    <Category>
      <Name>${this.escapeXml(discussion.category?.name || "")}</Name>
    </Category>
    <Repository>
      <Name>${this.escapeXml(discussion.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(discussion.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(discussion.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(discussion.author?.login || "")}</Login>
      <Url>${this.escapeXml(discussion.author?.url || "")}</Url>
    </Author>
  </Discussion>`;
  }

  private discussionCommentToXml(comment: GitHubEventUnion): string {
    if (comment.type !== "DiscussionComment") return "";
    return `  <DiscussionComment createdAt="${comment.createdAt}">
    <Body>${this.escapeXml(comment.body || "")}</Body>
    <Url>${this.escapeXml(comment.url || "")}</Url>
    <Discussion>
      <Title>${this.escapeXml(comment.discussion?.title || "")}</Title>
      <Url>${this.escapeXml(comment.discussion?.url || "")}</Url>
    </Discussion>
    <Repository>
      <Name>${this.escapeXml(comment.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(comment.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(comment.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(comment.author?.login || "")}</Login>
      <Url>${this.escapeXml(comment.author?.url || "")}</Url>
    </Author>
  </DiscussionComment>`;
  }

  private pullRequestToXml(pr: GitHubEventUnion): string {
    if (pr.type !== "PullRequest") return "";
    return `  <PullRequest createdAt="${pr.createdAt}" number="${pr.number}" state="${pr.state}">
    <Title>${this.escapeXml(pr.title || "")}</Title>
    <Body>${this.escapeXml(pr.body || "")}</Body>
    <Url>${this.escapeXml(pr.url || "")}</Url>
    <BaseRef>${this.escapeXml(pr.baseRef || "")}</BaseRef>
    <HeadRef>${this.escapeXml(pr.headRef || "")}</HeadRef>
    <ChangedFiles>${pr.changedFiles || 0}</ChangedFiles>
    <Additions>${pr.additions || 0}</Additions>
    <Deletions>${pr.deletions || 0}</Deletions>
    <Repository>
      <Name>${this.escapeXml(pr.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(pr.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(pr.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(pr.author?.login || "")}</Login>
      <Url>${this.escapeXml(pr.author?.url || "")}</Url>
    </Author>
  </PullRequest>`;
  }

  private pullRequestReviewToXml(review: GitHubEventUnion): string {
    if (review.type !== "PullRequestReview") return "";
    return `  <PullRequestReview createdAt="${review.createdAt}" state="${review.state}">
    <Body>${this.escapeXml(review.body || "")}</Body>
    <Url>${this.escapeXml(review.url || "")}</Url>
    <PullRequest>
      <Number>${review.pullRequest?.number || 0}</Number>
      <Title>${this.escapeXml(review.pullRequest?.title || "")}</Title>
      <Url>${this.escapeXml(review.pullRequest?.url || "")}</Url>
    </PullRequest>
    <Repository>
      <Name>${this.escapeXml(review.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(review.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(review.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(review.author?.login || "")}</Login>
      <Url>${this.escapeXml(review.author?.url || "")}</Url>
    </Author>
  </PullRequestReview>`;
  }

  private commitToXml(commit: GitHubEventUnion): string {
    if (commit.type !== "Commit") return "";
    return `  <Commit createdAt="${commit.createdAt}" sha="${commit.sha}">
    <Message>${this.escapeXml(commit.message || "")}</Message>
    <Url>${this.escapeXml(commit.url || "")}</Url>
    <Additions>${commit.additions || 0}</Additions>
    <Deletions>${commit.deletions || 0}</Deletions>
    <ChangedFiles>${commit.changedFiles || 0}</ChangedFiles>
    <Repository>
      <Name>${this.escapeXml(commit.repository?.name || "")}</Name>
      <Owner>${this.escapeXml(commit.repository?.owner || "")}</Owner>
      <Url>${this.escapeXml(commit.repository?.url || "")}</Url>
    </Repository>
    <Author>
      <Login>${this.escapeXml(commit.author?.login || "")}</Login>
      <Url>${this.escapeXml(commit.author?.url || "")}</Url>
    </Author>
  </Commit>`;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;"); // cspell:disable-line
  }
}
