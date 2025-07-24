import { describe, expect, it } from "vitest";
import type {
  Commit,
  Discussion,
  DiscussionComment,
  GitHubEventUnion,
  Issue,
  IssueComment,
  PullRequest,
  PullRequestReview,
} from "../types/index.js";
import { XmlGenerator } from "./xml.js";

describe("XmlGenerator", () => {
  const generator = new XmlGenerator();

  it("should generate valid XML for empty events array", () => {
    const events: GitHubEventUnion[] = [];
    const result = generator.generate(events, "asc");

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain("<GitHubEvents>");
    expect(result).toContain("</GitHubEvents>");
  });

  it("should sort events in ascending order", () => {
    const events: GitHubEventUnion[] = [
      {
        type: "Issue",
        number: 2,
        state: "OPEN",
        title: "Second Issue",
        body: "Second issue body",
        url: "https://github.com/owner/repo/issues/2",
        createdAt: "2023-01-02T00:00:00Z",
        labels: [],
        author: { login: "user2", url: "https://github.com/user2" },
        repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
      } as Issue,
      {
        type: "Issue",
        number: 1,
        state: "CLOSED",
        title: "First Issue",
        body: "First issue body",
        url: "https://github.com/owner/repo/issues/1",
        createdAt: "2023-01-01T00:00:00Z",
        labels: [],
        author: { login: "user1", url: "https://github.com/user1" },
        repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
      } as Issue,
    ];

    const result = generator.generate(events, "asc");

    expect(result.indexOf("First Issue")).toBeLessThan(result.indexOf("Second Issue"));
  });

  it("should sort events in descending order", () => {
    const events: GitHubEventUnion[] = [
      {
        type: "Issue",
        number: 1,
        state: "CLOSED",
        title: "First Issue",
        body: "First issue body",
        url: "https://github.com/owner/repo/issues/1",
        createdAt: "2023-01-01T00:00:00Z",
        labels: [],
        author: { login: "user1", url: "https://github.com/user1" },
        repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
      } as Issue,
      {
        type: "Issue",
        number: 2,
        state: "OPEN",
        title: "Second Issue",
        body: "Second issue body",
        url: "https://github.com/owner/repo/issues/2",
        createdAt: "2023-01-02T00:00:00Z",
        labels: [],
        author: { login: "user2", url: "https://github.com/user2" },
        repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
      } as Issue,
    ];

    const result = generator.generate(events, "desc");

    expect(result.indexOf("Second Issue")).toBeLessThan(result.indexOf("First Issue"));
  });

  it("should generate XML for Issue event", () => {
    const issue: Issue = {
      type: "Issue",
      number: 123,
      state: "OPEN",
      title: "Test Issue",
      body: "Issue description",
      url: "https://github.com/owner/repo/issues/123",
      createdAt: "2023-01-01T00:00:00Z",
      labels: [
        { name: "bug", color: "d73a49" },
        { name: "priority-high", color: "b60205" },
      ],
      author: { login: "testuser", url: "https://github.com/testuser" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([issue], "asc");

    expect(result).toContain('<Issue createdAt="2023-01-01T00:00:00Z" number="123" state="OPEN">');
    expect(result).toContain("<Title>Test Issue</Title>");
    expect(result).toContain("<Body>Issue description</Body>");
    expect(result).toContain('<Label name="bug" color="d73a49" />');
    expect(result).toContain('<Label name="priority-high" color="b60205" />');
    expect(result).toContain("<Login>testuser</Login>");
    expect(result).toContain("<Name>testrepo</Name>");
    expect(result).toContain("<Owner>testowner</Owner>");
  });

  it("should generate XML for IssueComment event", () => {
    const comment: IssueComment = {
      type: "IssueComment",
      body: "This is a comment",
      url: "https://github.com/owner/repo/issues/123#issuecomment-456",
      createdAt: "2023-01-01T12:00:00Z",
      issue: {
        number: 123,
        title: "Test Issue",
        url: "https://github.com/owner/repo/issues/123",
      },
      author: { login: "commenter", url: "https://github.com/commenter" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([comment], "asc");

    expect(result).toContain('<IssueComment createdAt="2023-01-01T12:00:00Z">');
    expect(result).toContain("<Body>This is a comment</Body>");
    expect(result).toContain("<Number>123</Number>");
    expect(result).toContain("<Title>Test Issue</Title>");
  });

  it("should generate XML for Discussion event", () => {
    const discussion: Discussion = {
      type: "Discussion",
      title: "Discussion Title",
      body: "Discussion content",
      url: "https://github.com/owner/repo/discussions/1",
      createdAt: "2023-01-01T10:00:00Z",
      category: { name: "General" },
      author: { login: "discusser", url: "https://github.com/discusser" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([discussion], "asc");

    expect(result).toContain('<Discussion createdAt="2023-01-01T10:00:00Z">');
    expect(result).toContain("<Title>Discussion Title</Title>");
    expect(result).toContain("<Body>Discussion content</Body>");
    expect(result).toContain("<Name>General</Name>");
  });

  it("should generate XML for DiscussionComment event", () => {
    const comment: DiscussionComment = {
      type: "DiscussionComment",
      body: "Discussion comment",
      url: "https://github.com/owner/repo/discussions/1#discussioncomment-123",
      createdAt: "2023-01-01T11:00:00Z",
      discussion: {
        title: "Discussion Title",
        url: "https://github.com/owner/repo/discussions/1",
      },
      author: { login: "commenter", url: "https://github.com/commenter" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([comment], "asc");

    expect(result).toContain('<DiscussionComment createdAt="2023-01-01T11:00:00Z">');
    expect(result).toContain("<Body>Discussion comment</Body>");
    expect(result).toContain("<Title>Discussion Title</Title>");
  });

  it("should generate XML for PullRequest event", () => {
    const pr: PullRequest = {
      type: "PullRequest",
      number: 42,
      state: "MERGED",
      title: "Feature PR",
      body: "PR description",
      url: "https://github.com/owner/repo/pull/42",
      createdAt: "2023-01-01T14:00:00Z",
      baseRef: "main",
      headRef: "feature-branch",
      changedFiles: 5,
      additions: 100,
      deletions: 20,
      author: { login: "developer", url: "https://github.com/developer" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([pr], "asc");

    expect(result).toContain(
      '<PullRequest createdAt="2023-01-01T14:00:00Z" number="42" state="MERGED">',
    );
    expect(result).toContain("<Title>Feature PR</Title>");
    expect(result).toContain("<BaseRef>main</BaseRef>");
    expect(result).toContain("<HeadRef>feature-branch</HeadRef>");
    expect(result).toContain("<ChangedFiles>5</ChangedFiles>");
    expect(result).toContain("<Additions>100</Additions>");
    expect(result).toContain("<Deletions>20</Deletions>");
  });

  it("should generate XML for PullRequestReview event", () => {
    const review: PullRequestReview = {
      type: "PullRequestReview",
      state: "APPROVED",
      body: "LGTM!",
      url: "https://github.com/owner/repo/pull/42#pullrequestreview-123",
      createdAt: "2023-01-01T15:00:00Z",
      pullRequest: {
        number: 42,
        title: "Feature PR",
        url: "https://github.com/owner/repo/pull/42",
      },
      author: { login: "reviewer", url: "https://github.com/reviewer" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([review], "asc");

    expect(result).toContain(
      '<PullRequestReview createdAt="2023-01-01T15:00:00Z" state="APPROVED">',
    );
    expect(result).toContain("<Body>LGTM!</Body>");
    expect(result).toContain("<Number>42</Number>");
    expect(result).toContain("<Title>Feature PR</Title>");
  });

  it("should generate XML for Commit event", () => {
    const commit: Commit = {
      type: "Commit",
      sha: "abc123def456",
      message: "Add new feature",
      url: "https://github.com/owner/repo/commit/abc123def456",
      createdAt: "2023-01-01T16:00:00Z",
      additions: 50,
      deletions: 10,
      changedFiles: 3,
      author: { login: "developer", url: "https://github.com/developer" },
      repository: {
        name: "testrepo",
        owner: "testowner",
        url: "https://github.com/testowner/testrepo",
      },
    };

    const result = generator.generate([commit], "asc");

    expect(result).toContain('<Commit createdAt="2023-01-01T16:00:00Z" sha="abc123def456">');
    expect(result).toContain("<Message>Add new feature</Message>");
    expect(result).toContain("<Additions>50</Additions>");
    expect(result).toContain("<Deletions>10</Deletions>");
    expect(result).toContain("<ChangedFiles>3</ChangedFiles>");
  });

  it("should escape XML special characters", () => {
    const issue: Issue = {
      type: "Issue",
      number: 1,
      state: "OPEN",
      title: 'Title with "quotes" & <tags>',
      body: "Body with 'apostrophes' & <script>alert('xss')</script>",
      url: "https://github.com/owner/repo/issues/1",
      createdAt: "2023-01-01T00:00:00Z",
      labels: [],
      author: { login: "user", url: "https://github.com/user" },
      repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
    };

    const result = generator.generate([issue], "asc");

    expect(result).toContain("Title with &quot;quotes&quot; &amp; &lt;tags&gt;");
    expect(result).toContain(
      "Body with &apos;apostrophes&apos; &amp; &lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt;",
    );
  });

  it("should handle undefined/null values gracefully", () => {
    const issue: Issue = {
      type: "Issue",
      number: 1,
      state: "OPEN",
      title: undefined,
      body: null,
      url: undefined,
      createdAt: "2023-01-01T00:00:00Z",
      labels: [],
      author: undefined,
      repository: undefined,
    } as any;

    const result = generator.generate([issue], "asc");

    expect(result).toContain("<Title></Title>");
    expect(result).toContain("<Body></Body>");
    expect(result).toContain("<Url></Url>");
  });

  it("should handle events with missing optional properties", () => {
    const events: GitHubEventUnion[] = [
      {
        type: "Issue",
        number: 1,
        state: "OPEN",
        createdAt: "2023-01-01T00:00:00Z",
        labels: [],
      } as Issue,
      {
        type: "Commit",
        sha: "abc123",
        createdAt: "2023-01-01T00:00:00Z",
      } as Commit,
    ];

    const result = generator.generate(events, "asc");

    expect(result).toContain("<Issue");
    expect(result).toContain("<Commit");
    expect(() => generator.generate(events, "asc")).not.toThrow();
  });

  it("should handle unknown event types gracefully", () => {
    const unknownEvent = {
      type: "UnknownType",
      createdAt: "2023-01-01T00:00:00Z",
    } as any;

    const result = generator.generate([unknownEvent], "asc");

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain("<GitHubEvents>");
    expect(result).toContain("</GitHubEvents>");
    expect(result).not.toContain("UnknownType");
  });

  it("should handle Issue with empty labels array", () => {
    const issue: Issue = {
      type: "Issue",
      number: 1,
      state: "OPEN",
      title: "Test Issue",
      body: "Test body",
      url: "https://github.com/owner/repo/issues/1",
      createdAt: "2023-01-01T00:00:00Z",
      labels: [],
      author: { login: "user", url: "https://github.com/user" },
      repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
    };

    const result = generator.generate([issue], "asc");

    expect(result).toContain("<Labels>");
    expect(result).toContain("</Labels>");
    // Should not contain individual Label elements for empty array
    expect(result).not.toContain("<Label name=");
  });

  it("should handle Issue with no labels property", () => {
    const issue = {
      type: "Issue",
      number: 1,
      state: "OPEN",
      title: "Test Issue",
      body: "Test body",
      url: "https://github.com/owner/repo/issues/1",
      createdAt: "2023-01-01T00:00:00Z",
      author: { login: "user", url: "https://github.com/user" },
      repository: { name: "repo", owner: "owner", url: "https://github.com/owner/repo" },
    } as Issue;

    const result = generator.generate([issue], "asc");

    expect(result).toContain("<Labels>");
    expect(result).toContain("</Labels>");
  });

  it("should handle different event types with type guard checks", () => {
    const events: GitHubEventUnion[] = [
      {
        type: "Issue",
        number: 1,
        state: "OPEN",
        createdAt: "2023-01-01T00:00:00Z",
        labels: [],
      } as Issue,
      {
        type: "IssueComment",
        body: "Comment",
        createdAt: "2023-01-01T00:00:00Z",
        issue: { number: 1, title: "Issue", url: "url" },
      } as IssueComment,
      {
        type: "Discussion",
        title: "Discussion",
        createdAt: "2023-01-01T00:00:00Z",
        category: { name: "General" },
      } as Discussion,
      {
        type: "DiscussionComment",
        body: "Comment",
        createdAt: "2023-01-01T00:00:00Z",
        discussion: { title: "Discussion", url: "url" },
      } as DiscussionComment,
      {
        type: "PullRequest",
        number: 1,
        state: "OPEN",
        createdAt: "2023-01-01T00:00:00Z",
        baseRef: "main",
        headRef: "feature",
        changedFiles: 1,
        additions: 10,
        deletions: 5,
      } as PullRequest,
      {
        type: "PullRequestReview",
        state: "APPROVED",
        createdAt: "2023-01-01T00:00:00Z",
        pullRequest: { number: 1, title: "PR", url: "url" },
      } as PullRequestReview,
      {
        type: "Commit",
        sha: "abc123",
        message: "Commit message",
        createdAt: "2023-01-01T00:00:00Z",
        additions: 10,
        deletions: 5,
        changedFiles: 1,
      } as Commit,
    ];

    const result = generator.generate(events, "asc");

    expect(result).toContain("<Issue");
    expect(result).toContain("<IssueComment");
    expect(result).toContain("<Discussion");
    expect(result).toContain("<DiscussionComment");
    expect(result).toContain("<PullRequest");
    expect(result).toContain("<PullRequestReview");
    expect(result).toContain("<Commit");
  });

  it("should handle wrong type guards in private methods", () => {
    const wrongTypeEvent = {
      type: "PullRequest",
      createdAt: "2023-01-01T00:00:00Z",
    } as any;

    // Call generate which should handle type mismatches
    const result = generator.generate([wrongTypeEvent], "asc");

    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain("<GitHubEvents>");
    expect(result).toContain("</GitHubEvents>");
  });
});
