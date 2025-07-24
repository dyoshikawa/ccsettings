export interface GitHubEvent {
  type:
    | "Issue"
    | "IssueComment"
    | "Discussion"
    | "DiscussionComment"
    | "PullRequest"
    | "PullRequestReview"
    | "Commit";
  createdAt: string;
  url?: string;
  title?: string;
  body?: string;
  author?: {
    login: string;
    url: string;
  };
  repository?: {
    name: string;
    owner: string;
    url: string;
  };
}

export interface Issue extends GitHubEvent {
  type: "Issue";
  number: number;
  state: "OPEN" | "CLOSED";
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface IssueComment extends GitHubEvent {
  type: "IssueComment";
  issue: {
    number: number;
    title: string;
    url: string;
  };
}

export interface Discussion extends GitHubEvent {
  type: "Discussion";
  category: {
    name: string;
  };
}

export interface DiscussionComment extends GitHubEvent {
  type: "DiscussionComment";
  discussion: {
    title: string;
    url: string;
  };
}

export interface PullRequest extends GitHubEvent {
  type: "PullRequest";
  number: number;
  state: "OPEN" | "CLOSED" | "MERGED";
  baseRef: string;
  headRef: string;
  changedFiles: number;
  additions: number;
  deletions: number;
}

export interface PullRequestReview extends GitHubEvent {
  type: "PullRequestReview";
  state: "APPROVED" | "CHANGES_REQUESTED" | "COMMENTED";
  pullRequest: {
    number: number;
    title: string;
    url: string;
  };
}

export interface Commit extends GitHubEvent {
  type: "Commit";
  sha: string;
  message: string;
  additions: number;
  deletions: number;
  changedFiles: number;
}

export type GitHubEventUnion =
  | Issue
  | IssueComment
  | Discussion
  | DiscussionComment
  | PullRequest
  | PullRequestReview
  | Commit;

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    type: string;
  }>;
}
