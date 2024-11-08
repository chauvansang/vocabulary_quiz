import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash, FiList } from "react-icons/fi"

import type {ItemPublic, Quiz, UserPublic, Leaderboard} from "../../client"
import { useState, useEffect } from "react"
import EditQuiz from "../Quizzes/EditQuiz"
import Delete from "./DeleteAlert"
import EditUser from "../Admin/EditUser.tsx";
import LeaderboardModal from "./LeaderboardModal";
import {QuizzesService} from "../../client";

interface ActionsMenuProps {
  type: string
  value: ItemPublic | UserPublic | Quiz
  disabled?: boolean
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])

  useEffect(() => {
    // Fetch leaderboard data
    const fetchLeaderboard = async () => {
      const response = await QuizzesService.getLeaderboard(value.id)
      setLeaderboard(response)
    }
    fetchLeaderboard()
  }, [value.id])
  const leaderboardModal = useDisclosure()
  const editUserModal = useDisclosure()
  const deleteModal = useDisclosure()

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          {type === "Quiz" && (
            <MenuItem
              onClick={leaderboardModal.onOpen}
              icon={<FiList fontSize="16px" />}
            >
              View Leaderboard
            </MenuItem>
          )}
          <MenuItem
            onClick={editUserModal.onOpen}
            icon={<FiEdit fontSize="16px" />}
          >
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        {type === "Quiz" && (
          <LeaderboardModal
            leaderboard={leaderboard}
            isOpen={leaderboardModal.isOpen}
            onClose={leaderboardModal.onClose}
          />
        )}
        {type === "User" ? (
          <EditUser
            user={value as UserPublic}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        ) : (
          <EditQuiz
            quiz={value as Quiz}
            isOpen={editUserModal.isOpen}
            onClose={editUserModal.onClose}
          />
        )}
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
      {type === "Quiz" && (
        <LeaderboardModal
          leaderboard={leaderboard}
          isOpen={leaderboardModal.isOpen}
          onClose={leaderboardModal.onClose}
        />
      )}
    </>
  )
}

export default ActionsMenu
