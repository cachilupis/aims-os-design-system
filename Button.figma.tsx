/**
 * Button.figma.tsx — Code Connect example
 *
 * Links the Figma "Buttons-NEW" component set to the real code component
 * so the Figma MCP server feeds Claude Code the actual import + usage
 * instead of letting it hand-roll a button.
 *
 * One file like this per core component. Map the Figma `variant` property
 * to your code `variant` prop, etc. You can also create these mappings
 * visually in Figma Dev Mode -> Library -> Connect components to code.
 */
import figma from "@figma/code-connect";
import { Button } from "./Button";

figma.connect(
  Button,
  "https://www.figma.com/design/v6rmYKA2zmyXWOahlxLOeI/Design-System---AIMS-OS?node-id=<BUTTON_NODE_ID>",
  {
    props: {
      // left = your code prop, right = the Figma property it maps to
      variant: figma.enum("Variant", {
        Primary: "primary",
        Secondary: "secondary",
        Ghost: "ghost",
        Danger: "danger",
      }),
      size: figma.enum("Size", { Small: "sm", Medium: "md", Large: "lg" }),
      disabled: figma.boolean("Disabled"),
      label: figma.string("Label"),
    },
    example: ({ variant, size, disabled, label }) => (
      <Button variant={variant} size={size} disabled={disabled}>
        {label}
      </Button>
    ),
  }
);
