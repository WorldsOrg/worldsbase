import { Button, ButtonProps } from '@chakra-ui/react'

export const SidebarButton = (props: ButtonProps) => (
  <Button variant="tertiary" justifyContent="start" iconSpacing="3" {...props} />
)
