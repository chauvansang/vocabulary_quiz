import {
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { QuizzesService } from "../../../client"
import ActionsMenu from "../../../components/Common/ActionsMenu"
import Navbar from "../../../components/Common/Navbar"
import AddQuiz from "../../../components/Quizzes/AddQuiz"
import { PaginationFooter } from "../../../components/Common/PaginationFooter"

const quizzesSearchSchema = z.object({
  page: z.number().catch(1),
})

// @ts-ignore
export const Route = createFileRoute("/_layout/admin/quizzes")({
  component: Quizzes,
  validateSearch: (search) => quizzesSearchSchema.parse(search),
})

const PER_PAGE = 5

function getQuizzesQueryOptions({ page }: { page: number }) {
  return {
    queryFn: () =>
      QuizzesService.readQuizzes({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["quizzes", { page }],
  }
}

function QuizzesTable() {
  const queryClient = useQueryClient()
  const { page } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: {[key: string]: string}) => ({ ...prev, page }) })

  const {
    data: quizzes,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getQuizzesQueryOptions({ page }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && quizzes?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getQuizzesQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage])

  return (
    <>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              <Tr>
                {new Array(4).fill(null).map((_, index) => (
                  <Td key={index}>
                    <SkeletonText noOfLines={1} paddingBlock="16px" />
                  </Td>
                ))}
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {quizzes?.data.map((quiz) => (
                <Tr key={quiz.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>{quiz.id}</Td>
                  <Td isTruncated maxWidth="150px">
                    {quiz.name}
                  </Td>
                  <Td>
                    <ActionsMenu type={"Quiz"} value={quiz} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <PaginationFooter
        page={page}
        onChangePage={setPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </>
  )
}

function Quizzes() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Quizzes Management
      </Heading>

      <Navbar type={"Quiz"} addModalAs={AddQuiz} />
      <QuizzesTable />
    </Container>
  )
}
