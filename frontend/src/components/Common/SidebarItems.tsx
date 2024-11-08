import {Box, Flex, Icon, Text, useColorModeValue} from "@chakra-ui/react"
import {useQueryClient} from "@tanstack/react-query"
import {Link} from "@tanstack/react-router"
import {FiBriefcase, FiList, FiUsers} from "react-icons/fi"

import type {UserPublic} from "../../client"

const items = [
  { icon: FiBriefcase, title: "Quizzes", path: "/quizzes/join" },
  { icon: FiList, title: "Leaderboard", path: "/leaderboard" },
]

interface SidebarItemsProps {
  onClose?: () => void
}

const SidebarItems = ({ onClose }: SidebarItemsProps) => {
  const queryClient = useQueryClient()
  const textColor = useColorModeValue("ui.main", "ui.light")
  const bgActive = useColorModeValue("#E2E8F0", "#4A5568")
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])

  const superuserItems = [
    { icon: FiUsers, title: "User Management", path: "/admin/users" },
    { icon: FiBriefcase, title: "Quiz Management", path: "/admin/quizzes" },
  ]

  const finalItems = currentUser?.is_superuser ? [...items, ...superuserItems] : items

  const listItems = finalItems.map(({ icon, title, path }) => (
    <Flex
      as={Link}
      to={path}
      w="100%"
      p={2}
      key={title}
      activeProps={{
        style: {
          background: bgActive,
          borderRadius: "12px",
        },
      }}
      color={textColor}
      onClick={onClose}
    >
      <Icon as={icon} alignSelf="center" />
      <Text ml={2}>{title}</Text>
    </Flex>
  ))

  return (
    <>
      <Box>{listItems}</Box>
    </>
  )
}

export default SidebarItems
