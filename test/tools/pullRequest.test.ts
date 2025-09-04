import { jest } from '@jest/globals';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type PullRequest from '../../controllers/pullRequest';

// This export makes the file a module, allowing top-level await.
export {};

const { registerPullRequestTools } = await import('../../tools/pullRequest');

// Mock modules for ES module support
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation(() => ({
    tool: jest.fn(),
  })),
}));

jest.unstable_mockModule('../../controllers/pullRequest', () => ({
  default: jest.fn().mockImplementation(() => ({
    getPullRequest: jest.fn(),
    getListPullRequests: jest.fn(),
    mergePullRequest: jest.fn(),
    getPullRequestFiles: jest.fn(),
    getPullRequestStatus: jest.fn(),
    updatePullRequestBranch: jest.fn(),
    getPullRequestComments: jest.fn(),
    getPullRequestReviews: jest.fn(),
    createPullRequestReview: jest.fn(),
    createPullRequest: jest.fn(),
    addPullRequestReviewComment: jest.fn(),
    updatePullRequest: jest.fn(),
  })),
}));

describe("registerPullRequestTools", () => {
  let mockServer: jest.Mocked<McpServer>;
  let mockPullRequestInstance: jest.Mocked<PullRequest>;

  beforeEach(async () => {
    // Reset modules to clear mock states between tests
    jest.resetModules();

    // Re-import modules for each test
    const { McpServer: MockMcpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    const PullRequestMock = (await import('../../controllers/pullRequest')).default;

    mockServer = new (MockMcpServer as any)({
      name: "mock-server",
      description: "A mock server for testing",
      version: "1.0.0",
    });

    mockPullRequestInstance = new (PullRequestMock as any)();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register the 'get_pull_request' tool", async () => {
    // Arrange
    const prInfo = { id: 1, title: "Test PR" };
    mockPullRequestInstance.getPullRequest.mockResolvedValue(prInfo);

    // Act
    registerPullRequestTools(mockServer, mockPullRequestInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'get_pull_request',
      'Get details of a specific pull request',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_pull_request');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    
    expect(mockPullRequestInstance.getPullRequest).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(prInfo, null, 2));
  });

  it("should register the 'list_pull_requests' tool", async () => {
    const prList = [{ id: 1, title: "Test PR" }];
    mockPullRequestInstance.getListPullRequests.mockResolvedValue(prList);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('list_pull_requests', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'list_pull_requests');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const args = { owner: 'o', repo: 'r' };
    const result = await (toolFunction as Function)(args);
    expect(mockPullRequestInstance.getListPullRequests).toHaveBeenCalledWith(args.owner, args.repo, undefined, undefined, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(prList, null, 2));
  });

  it("should register the 'merge_pull_request' tool", async () => {
    const mergeInfo = { merged: true };
    mockPullRequestInstance.mergePullRequest.mockResolvedValue(mergeInfo);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('merge_pull_request', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'merge_pull_request');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.mergePullRequest).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(mergeInfo, null, 2));
  });

  it("should register the 'get_pull_request_files' tool", async () => {
    const files = [{ filename: 'file.ts' }];
    mockPullRequestInstance.getPullRequestFiles.mockResolvedValue(files);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_pull_request_files', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_pull_request_files');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.getPullRequestFiles).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(files, null, 2));
  });

  it("should register the 'get_pull_request_status' tool", async () => {
    const status = { state: 'success' };
    mockPullRequestInstance.getPullRequestStatus.mockResolvedValue(status);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_pull_request_status', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_pull_request_status');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.getPullRequestStatus).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(status, null, 2));
  });

  it("should register the 'update_pull_request_branch' tool", async () => {
    const updateInfo = { message: 'updated' };
    mockPullRequestInstance.updatePullRequestBranch.mockResolvedValue(updateInfo);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('update_pull_request_branch', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'update_pull_request_branch');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.updatePullRequestBranch).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(updateInfo, null, 2));
  });

  it("should register the 'get_pull_request_comments' tool", async () => {
    const comments = [{ body: 'comment' }];
    mockPullRequestInstance.getPullRequestComments.mockResolvedValue(comments);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_pull_request_comments', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_pull_request_comments');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.getPullRequestComments).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(comments, null, 2));
  });

  it("should register the 'get_pull_request_reviews' tool", async () => {
    const reviews = [{ state: 'APPROVED' }];
    mockPullRequestInstance.getPullRequestReviews.mockResolvedValue(reviews);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_pull_request_reviews', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_pull_request_reviews');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.getPullRequestReviews).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(reviews, null, 2));
  });

  it("should register the 'create_pull_request_review' tool", async () => {
    const review = { id: 1, state: 'APPROVED' };
    mockPullRequestInstance.createPullRequestReview.mockResolvedValue(review);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('create_pull_request_review', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_pull_request_review');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.createPullRequestReview).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(review, null, 2));
  });

  it("should register the 'create_pull_request' tool", async () => {
    const newPr = { id: 2, title: 'New PR' };
    mockPullRequestInstance.createPullRequest.mockResolvedValue(newPr);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('create_pull_request', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_pull_request');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', title: 't', head: 'h', base: 'b' });
    expect(mockPullRequestInstance.createPullRequest).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(newPr, null, 2));
  });

  it("should register the 'add_pull_request_review_comment' tool", async () => {
    const comment = { id: 1, body: 'new comment' };
    mockPullRequestInstance.addPullRequestReviewComment.mockResolvedValue(comment);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('add_pull_request_review_comment', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'add_pull_request_review_comment');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1, body: 'b', path: 'p' });
    expect(mockPullRequestInstance.addPullRequestReviewComment).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(comment, null, 2));
  });

  it("should register the 'update_pull_request' tool", async () => {
    const updatedPr = { id: 1, title: 'Updated PR' };
    mockPullRequestInstance.updatePullRequest.mockResolvedValue(updatedPr);
    registerPullRequestTools(mockServer, mockPullRequestInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('update_pull_request', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'update_pull_request');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', pullNumber: 1 });
    expect(mockPullRequestInstance.updatePullRequest).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(updatedPr, null, 2));
  });
});
