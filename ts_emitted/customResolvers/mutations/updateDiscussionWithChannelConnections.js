var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { updateDiscussionChannelQuery, severConnectionBetweenDiscussionAndChannelQuery } from "../cypher/cypherQueries";
var getResolver = function (_a) {
    var Discussion = _a.Discussion, driver = _a.driver;
    return function (parent, args, context, info) { return __awaiter(void 0, void 0, void 0, function () {
        var discussionWhere, discussionUpdateInput, channelConnections, channelDisconnections, updatedDiscussionId, session, i, channelUniqueName, i, channelUniqueName, selectionSet, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    discussionWhere = args.discussionWhere, discussionUpdateInput = args.discussionUpdateInput, channelConnections = args.channelConnections, channelDisconnections = args.channelDisconnections;
                    if (!channelConnections || channelConnections.length === 0) {
                        throw new Error("At least one channel must be selected. To remove a discussion from all channels, use the deleteDiscussion mutation.");
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    // Update the discussion
                    return [4 /*yield*/, Discussion.update({
                            where: discussionWhere,
                            update: discussionUpdateInput,
                        })];
                case 2:
                    // Update the discussion
                    _a.sent();
                    updatedDiscussionId = discussionWhere.id;
                    session = driver.session();
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < channelConnections.length)) return [3 /*break*/, 6];
                    channelUniqueName = channelConnections[i];
                    // For each channel connection, create a DiscussionChannel node
                    // if one does not already exist.
                    // Join the DiscussionChannel to the Discussion and Channel nodes.
                    // If there was an existing one, join that. If we just created one,
                    // join that.
                    return [4 /*yield*/, session.run(updateDiscussionChannelQuery, {
                            discussionId: updatedDiscussionId,
                            channelUniqueName: channelUniqueName,
                        })];
                case 4:
                    // For each channel connection, create a DiscussionChannel node
                    // if one does not already exist.
                    // Join the DiscussionChannel to the Discussion and Channel nodes.
                    // If there was an existing one, join that. If we just created one,
                    // join that.
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    i = 0;
                    _a.label = 7;
                case 7:
                    if (!(i < channelDisconnections.length)) return [3 /*break*/, 10];
                    channelUniqueName = channelDisconnections[i];
                    // For each channel disconnection, sever the connection between
                    // the Discussion and the DiscussionChannel node.
                    // We intentionally do not delete the DiscussionChannel node
                    // because it contains comments that are authored by other users
                    // than the discussion author, and the discussion author should
                    // not have permission to delete those comments.
                    return [4 /*yield*/, session.run(severConnectionBetweenDiscussionAndChannelQuery, {
                            discussionId: updatedDiscussionId,
                            channelUniqueName: channelUniqueName,
                        })];
                case 8:
                    // For each channel disconnection, sever the connection between
                    // the Discussion and the DiscussionChannel node.
                    // We intentionally do not delete the DiscussionChannel node
                    // because it contains comments that are authored by other users
                    // than the discussion author, and the discussion author should
                    // not have permission to delete those comments.
                    _a.sent();
                    _a.label = 9;
                case 9:
                    i++;
                    return [3 /*break*/, 7];
                case 10:
                    selectionSet = "\n        {\n          id\n          title\n          body\n          Author {\n            username\n          }\n          DiscussionChannels {\n            id\n            channelUniqueName\n            discussionId\n            Channel {\n              uniqueName\n            }\n            Discussion {\n              id\n            }\n          }\n          createdAt\n          updatedAt\n          Tags {\n            text\n          }\n        }\n      ";
                    return [4 /*yield*/, Discussion.find({
                            where: {
                                id: updatedDiscussionId,
                            },
                            selectionSet: selectionSet,
                        })];
                case 11:
                    result = _a.sent();
                    session.close();
                    return [2 /*return*/, result[0]];
                case 12:
                    error_1 = _a.sent();
                    console.error("Error updating discussion:", error_1);
                    throw new Error("Failed to update discussion. ".concat(error_1.message));
                case 13: return [2 /*return*/];
            }
        });
    }); };
};
export default getResolver;
