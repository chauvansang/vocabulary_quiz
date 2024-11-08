import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react"
import { Leaderboard } from "../../client"

interface LeaderboardModalProps {
  leaderboard: Leaderboard[]
  isOpen: boolean
  onClose: () => void
}

const LeaderboardModal = ({ leaderboard, isOpen, onClose }: LeaderboardModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leaderboard</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Table>
            <Thead>
              <Tr>
                <Th>User</Th>
                <Th>Score</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaderboard.map((entry, index) => (
                <Tr key={index}>
                  <Td>{entry.user_id}</Td>
                  <Td>{entry.score}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LeaderboardModal
