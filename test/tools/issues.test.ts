import { jest } from '@jest/globals';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type Issues from '../../controllers/issues';

// This export makes the file a module, allowing top-level await.
export {};

const { McpServer: McpServerImpl } = await import('@modelcontextprotocol/sdk/server/mcp.js');
const { registerIssueTools } = await import('../../tools/issues');
const IssuesImpl = (await import('../../controllers/issues')).default;

// Mock modules for ES module support
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation(() => ({
    tool: jest.fn(),
  })),
}));

jest.unstable_mockModule('../../controllers/issues', () => ({
  default: jest.fn().mockImplementation(() => ({
    getUserInfo: jest.fn(),
    getIssues: jest.fn(),
    getComments: jest.fn(),
    createIssue: jest.fn(),
    addComment: jest.fn(),
    listIssues: jest.fn(),
    updateIssue: jest.fn(),
    searchIssues: jest.fn(),
  })),
}));

describe("registerIssueTools", () => {
  let mockServer: jest.Mocked<McpServer>;
  let mockIssuesInstance: jest.Mocked<Issues>;

  beforeEach(async () => {
    // Reset modules to clear mock states between tests
    jest.resetModules();

    // Re-import modules for each test
    const { McpServer: MockMcpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    const IssuesMock = (await import('../../controllers/issues')).default;

    mockServer = new (MockMcpServer as any)({
      name: "mock-server",
      description: "A mock server for testing",
      version: "1.0.0",
    });

    mockIssuesInstance = new (IssuesMock as any)();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register the 'get_me' tool", async () => {
    // Arrange
    const userInfo = { login: "testuser" };
    mockIssuesInstance.getUserInfo.mockResolvedValue(userInfo);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_me',
      'Get details of the authenticated user',
      {},
      expect.any(Function)
    );

    // Optionally, test the registered tool's behavior
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_me');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)();
    
    expect(mockIssuesInstance.getUserInfo).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(userInfo, null, 2));
  });

  it("should register the 'get_issue' tool", async () => {
    // Arrange
    const issueInfo = { id: 1, title: "Test Issue" };
    const args = { owner: "testowner", repo: "testrepo", issueNumber: 1 };
    mockIssuesInstance.getIssues.mockResolvedValue(issueInfo);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_issue',
      'Gets the contents of an issue within a repository',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_issue');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.getIssues).toHaveBeenCalledWith(args.owner, args.repo, args.issueNumber);
    expect(result.content[0].text).toBe(JSON.stringify(issueInfo, null, 2));
  });

  it("should register the 'get_issue_comments' tool", async () => {
    // Arrange
    const comments = [{ id: 1, body: "Test comment" }];
    const args = { owner: "testowner", repo: "testrepo", issueNumber: 1 };
    mockIssuesInstance.getComments.mockResolvedValue(comments);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_issue_comments',
      'Get comments for a GitHub issue',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_issue_comments');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.getComments).toHaveBeenCalledWith(args.owner, args.repo, args.issueNumber);
    expect(result.content[0].text).toBe(JSON.stringify(comments, null, 2));
  });

  it("should register the 'create_issue' tool", async () => {
    // Arrange
    const newIssue = { id: 2, title: "New Issue" };
    const args = { owner: "testowner", repo: "testrepo", title: "New Issue", body: "This is a new issue." };
    mockIssuesInstance.createIssue.mockResolvedValue(newIssue);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'create_issue',
      'Create a new issue in a GitHub repository',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_issue');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.createIssue).toHaveBeenCalledWith(args.owner, args.repo, args.title, args.body, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(newIssue, null, 2));
  });

  it("should register the 'add_issue_comment' tool", async () => {
    // Arrange
    const newComment = { id: 2, body: "Another comment" };
    const args = { owner: "testowner", repo: "testrepo", issueNumber: 1, comment: "Another comment" };
    mockIssuesInstance.addComment.mockResolvedValue(newComment);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'add_issue_comment',
      'Add a comment to an issue',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'add_issue_comment');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.addComment).toHaveBeenCalledWith(args.owner, args.repo, args.issueNumber, args.comment);
    expect(result.content[0].text).toBe(JSON.stringify(newComment, null, 2));
  });

  it("should register the 'list_issues' tool", async () => {
    // Arrange
    const issuesList = [{ id: 1, title: "Issue 1" }, { id: 2, title: "Issue 2" }];
    const args = { owner: "testowner", repo: "testrepo", state: "open" };
    mockIssuesInstance.listIssues.mockResolvedValue(issuesList);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'list_issues',
      'List and filter repository issues',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'list_issues');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.listIssues).toHaveBeenCalledWith(args.owner, args.repo, args.state, undefined, undefined, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(issuesList, null, 2));
  });

  it("should register the 'update_issue' tool", async () => {
    // Arrange
    const updatedIssue = { id: 1, title: "Updated Title" };
    const args = { owner: "testowner", repo: "testrepo", issueNumber: 1, title: "Updated Title" };
    mockIssuesInstance.updateIssue.mockResolvedValue(updatedIssue);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'update_issue',
      'Update an issue in a GitHub repository',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'update_issue');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.updateIssue).toHaveBeenCalledWith(args.owner, args.repo, args.issueNumber, args.title, undefined, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(updatedIssue, null, 2));
  });

  it("should register the 'search_issues' tool", async () => {
    // Arrange
    const searchResults = { items: [{ id: 1, title: "Found Issue" }] };
    const args = { owner: "testowner", repo: "testrepo", q: "is:open" };
    mockIssuesInstance.searchIssues.mockResolvedValue(searchResults);

    // Act
    registerIssueTools(mockServer, mockIssuesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'search_issues',
      'Search for issues and pull requests',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'search_issues');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)(args);

    expect(mockIssuesInstance.searchIssues).toHaveBeenCalledWith(args.owner, args.repo, args.q, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(searchResults, null, 2));
  });
});
