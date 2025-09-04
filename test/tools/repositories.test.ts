import { jest } from '@jest/globals';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type Repositories from '../../controllers/repositories';

// This export makes the file a module, allowing top-level await.
export {};

const { registerRepositoriesTools } = await import('../../tools/repositories');

// Mock modules for ES module support
jest.unstable_mockModule('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation(() => ({
    tool: jest.fn(),
  })),
}));

jest.unstable_mockModule('../../controllers/repositories', () => ({
  default: jest.fn().mockImplementation(() => ({
    CreateFileContents: jest.fn(),
    UpdateFileContents: jest.fn(),
    listBranches: jest.fn(),
    pushMultipleFiles: jest.fn(),
    searchRepositories: jest.fn(),
    createRepository: jest.fn(),
    getUserRepoInfo: jest.fn(),
    getUserRepos: jest.fn(),
    getFileContents: jest.fn(),
    createFork: jest.fn(),
    createBranch: jest.fn(),
    getBranchInfo: jest.fn(),
    listCommits: jest.fn(),
    getCommit: jest.fn(),
    getSpecificCommit: jest.fn(),
  })),
}));

describe("registerRepositoriesTools", () => {
  let mockServer: jest.Mocked<McpServer>;
  let mockRepositoriesInstance: jest.Mocked<Repositories>;

  beforeEach(async () => {
    // Reset modules to clear mock states between tests
    jest.resetModules();

    // Re-import modules for each test
    const { McpServer: MockMcpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    const RepositoriesMock = (await import('../../controllers/repositories')).default;

    mockServer = new (MockMcpServer as any)({
      name: "mock-server",
      description: "A mock server for testing",
      version: "1.0.0",
    });

    mockRepositoriesInstance = new (RepositoriesMock as any)();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register the 'create_file' tool", async () => {
    // Arrange
    const fileInfo = { content: {} };
    mockRepositoriesInstance.CreateFileContents.mockResolvedValue(fileInfo);

    // Act
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);

    // Assert
    expect(mockServer.tool).toHaveBeenCalledWith(
      'create_file',
      'Create a single file in a repository',
      expect.any(Object),
      expect.any(Function)
    );

    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_file');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', path: 'p', message: 'm', content: 'c' });
    
    expect(mockRepositoriesInstance.CreateFileContents).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(fileInfo, null, 2));
  });

  it("should register the 'update_file' tool", async () => {
    const fileInfo = { content: {} };
    mockRepositoriesInstance.UpdateFileContents.mockResolvedValue(fileInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('update_file', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'update_file');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', path: 'p', message: 'm', content: 'c', sha: 's' });
    expect(mockRepositoriesInstance.UpdateFileContents).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(fileInfo, null, 2));
  });

  it("should register the 'list_branches' tool", async () => {
    const branches = [{ name: 'main' }];
    mockRepositoriesInstance.listBranches.mockResolvedValue(branches);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('list_branches', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'list_branches');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const args = { owner: 'o', repo: 'r' };
    const result = await (toolFunction as Function)(args);
    expect(mockRepositoriesInstance.listBranches).toHaveBeenCalledWith(args.owner, args.repo, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(branches, null, 2));
  });

  it("should register the 'push_files' tool", async () => {
    const pushInfo = { commit: {} };
    mockRepositoriesInstance.pushMultipleFiles.mockResolvedValue(pushInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('push_files', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'push_files');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', branch: 'b', message: 'm', files: [] });
    expect(mockRepositoriesInstance.pushMultipleFiles).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(pushInfo, null, 2));
  });

  it("should register the 'search_repositories' tool", async () => {
    const repos = { items: [] };
    mockRepositoriesInstance.searchRepositories.mockResolvedValue(repos);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('search_repositories', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'search_repositories');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const args = { query: 'q' };
    const result = await (toolFunction as Function)(args);
    expect(mockRepositoriesInstance.searchRepositories).toHaveBeenCalledWith(args.query, undefined, undefined, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(repos, null, 2));
  });

  it("should register the 'create_repository' tool", async () => {
    const repoInfo = { id: 1 };
    mockRepositoriesInstance.createRepository.mockResolvedValue(repoInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('create_repository', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_repository');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ name: 'n' });
    expect(mockRepositoriesInstance.createRepository).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(repoInfo, null, 2));
  });

  it("should register the 'get_repository_info' tool", async () => {
    const repoInfo = { id: 1 };
    mockRepositoriesInstance.getUserRepoInfo.mockResolvedValue(repoInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_repository_info', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_repository_info');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r' });
    expect(mockRepositoriesInstance.getUserRepoInfo).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(repoInfo, null, 2));
  });

  it("should register the 'get_user_repositories' tool", async () => {
    const repos = [];
    mockRepositoriesInstance.getUserRepos.mockResolvedValue(repos);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_user_repositories', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_user_repositories');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const args = { userName: 'u' };
    const result = await (toolFunction as Function)(args);
    expect(mockRepositoriesInstance.getUserRepos).toHaveBeenCalledWith(args.userName, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(repos, null, 2));
  });

  it("should register the 'get_file_contents' tool", async () => {
    const fileContents = { content: 'c' };
    mockRepositoriesInstance.getFileContents.mockResolvedValue(fileContents);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_file_contents', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_file_contents');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', path: 'p' });
    expect(mockRepositoriesInstance.getFileContents).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(fileContents, null, 2));
  });

  it("should register the 'create_fork' tool", async () => {
    const forkInfo = { id: 1 };
    mockRepositoriesInstance.createFork.mockResolvedValue(forkInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('create_fork', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_fork');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r' });
    expect(mockRepositoriesInstance.createFork).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(forkInfo, null, 2));
  });

  it("should register the 'create_branch' tool", async () => {
    const branchInfo = { ref: 'r' };
    mockRepositoriesInstance.createBranch.mockResolvedValue(branchInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('create_branch', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'create_branch');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', branch: 'b', sha: 's' });
    expect(mockRepositoriesInstance.createBranch).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(branchInfo, null, 2));
  });

  it("should register the 'get_branch_info' tool", async () => {
    const branchInfo = { name: 'main' };
    mockRepositoriesInstance.getBranchInfo.mockResolvedValue(branchInfo);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_branch_info', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_branch_info');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', branch: 'b' });
    expect(mockRepositoriesInstance.getBranchInfo).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(branchInfo, null, 2));
  });

  it("should register the 'list_commits' tool", async () => {
    const commits = [];
    mockRepositoriesInstance.listCommits.mockResolvedValue(commits);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('list_commits', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'list_commits');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const args = { owner: 'o', repo: 'r' };
    const result = await (toolFunction as Function)(args);
    expect(mockRepositoriesInstance.listCommits).toHaveBeenCalledWith(args.owner, args.repo, undefined, undefined, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(commits, null, 2));
  });

  it("should register the 'get_commit' tool", async () => {
    const commit = { sha: 's' };
    mockRepositoriesInstance.getCommit.mockResolvedValue(commit);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_commit', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_commit');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const args = { owner: 'o', repo: 'r' };
    const result = await (toolFunction as Function)(args);
    expect(mockRepositoriesInstance.getCommit).toHaveBeenCalledWith(args.owner, args.repo, undefined, undefined, undefined, undefined, undefined);
    expect(result.content[0].text).toBe(JSON.stringify(commit, null, 2));
  });

  it("should register the 'get_specific_commit' tool", async () => {
    const commit = { sha: 's' };
    mockRepositoriesInstance.getSpecificCommit.mockResolvedValue(commit);
    registerRepositoriesTools(mockServer, mockRepositoriesInstance);
    expect(mockServer.tool).toHaveBeenCalledWith('get_specific_commit', expect.any(String), expect.any(Object), expect.any(Function));
    const toolCall = (mockServer.tool as jest.Mock).mock.calls.find(call => call[0] === 'get_specific_commit');
    expect(toolCall).toBeDefined();
    const toolFunction = toolCall![3];
    const result = await (toolFunction as Function)({ owner: 'o', repo: 'r', sha: 's' });
    expect(mockRepositoriesInstance.getSpecificCommit).toHaveBeenCalled();
    expect(result.content[0].text).toBe(JSON.stringify(commit, null, 2));
  });
});
