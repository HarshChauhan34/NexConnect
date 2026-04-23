import { useRef, useState } from "react";

function useChatPageState() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [unreadCounts, setUnreadCounts] = useState({});

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const [showManageModal, setShowManageModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [manageSearch, setManageSearch] = useState("");
  const [manageSearchResults, setManageSearchResults] = useState([]);
  const [updatingGroup, setUpdatingGroup] = useState(false);

  const selectedChatRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  return {
    search,
    setSearch,
    searchResults,
    setSearchResults,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    loadingSearch,
    setLoadingSearch,

    messages,
    setMessages,
    messageText,
    setMessageText,
    loadingMessages,
    setLoadingMessages,
    sendingMessage,
    setSendingMessage,
    uploadingFile,
    setUploadingFile,
    pendingAttachment,
    setPendingAttachment,

    socketConnected,
    setSocketConnected,
    typing,
    setTyping,
    isTyping,
    setIsTyping,

    unreadCounts,
    setUnreadCounts,

    showGroupModal,
    setShowGroupModal,
    groupName,
    setGroupName,
    groupSearch,
    setGroupSearch,
    groupSearchResults,
    setGroupSearchResults,
    selectedGroupUsers,
    setSelectedGroupUsers,
    creatingGroup,
    setCreatingGroup,

    showManageModal,
    setShowManageModal,
    renameValue,
    setRenameValue,
    manageSearch,
    setManageSearch,
    manageSearchResults,
    setManageSearchResults,
    updatingGroup,
    setUpdatingGroup,

    selectedChatRef,
    bottomRef,
    typingTimeoutRef,
  };
}

export default useChatPageState;
