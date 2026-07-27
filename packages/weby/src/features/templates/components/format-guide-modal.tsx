import { XIcon } from "@phosphor-icons/react";
import { useTheme } from "#/shared/hooks/use-theme";

interface FormatGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const H2 = ({ children }: { children: string }) => (
  <span className="block text-[11px] font-semibold lowercase text-text-dark/70 mt-3 mb-1">
    {children}
  </span>
);

const P = ({ children }: { children: string }) => (
  <span className="block text-[10px] leading-relaxed lowercase text-text-dark/40">{children}</span>
);

const Code = ({ children }: { children: string }) => (
  <pre className="my-1 px-3 py-2 border border-border-dark/40 bg-white/3 text-[10px] leading-relaxed overflow-x-auto font-mono text-text-dark/60">
    {children}
  </pre>
);

const HR = () => <div className="my-2 border-t border-border-dark/15" />;

export const FormatGuideModal = ({ isOpen, onClose }: FormatGuideModalProps) => {
  const { isDarkMode } = useTheme();
  const t = (dark: string, light: string) => (isDarkMode ? dark : light);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className={`w-full max-w-xl max-h-[85vh] flex flex-col border ${t("bg-bg-dark border-border-dark text-text-dark", "bg-bg-light border-border-light text-text-light")}`}
      >
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${t("border-border-dark", "border-border-light")}`}
        >
          <span className="text-[12px] font-medium lowercase">format guide</span>
          <button
            className={`p-1 transition-colors ${t("text-text-dark/40 hover:text-text-dark", "text-text-light/40 hover:text-text-light")}`}
            onClick={onClose}
            type="button"
          >
            <XIcon size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 text-left">
          <H2>section headers</H2>
          <P>
            Your template must have three sections. Each section starts with a heading on its own
            line. The parser looks for these exact headings:
          </P>
          <Code>{"## PROFILE\n## EXPERIENCE\n## PROJECTS"}</Code>
          <P>The order matters. Always put PROFILE first, then EXPERIENCE, then PROJECTS.</P>

          <HR />

          <H2>profile section</H2>
          <P>
            This is where you describe yourself. Put this right after the PROFILE heading. Every
            field is optional except the section heading itself. Here are the fields you can use:
          </P>
          <Code>
            {
              "Name: Your Full Name\nTagline: your title or tagline\nUsername: yourusername\nEmail: your@email.com\nDescription: short bio paragraph."
            }
          </Code>
          <P>
            You can also add links. Start with "Links:" on its own line, then list each link with a
            dash:
          </P>
          <Code>{"Links:\n- label: https://url.com\n- github: https://github.com/username"}</Code>
          <P>
            Each link needs a label and a url separated by a colon. The label is what shows up on
            the page, the url is where it links to.
          </P>

          <HR />

          <H2>experience section</H2>
          <P>
            This is your work history. Each job or role is a separate entry. Start each entry with
            three hashes followed by the job title and company name separated by an em dash:
          </P>
          <Code>
            {
              "### Job Title — Company Name\n- Location: Remote (City, Country)\n- Period: Month YY' – Present"
            }
          </Code>
          <P>
            You can add as many experience entries as you want. Just repeat the pattern for each
            role.
          </P>

          <HR />

          <H2>projects section</H2>
          <P>
            This is where you show off your work. Each project is an entry starting with three
            hashes:
          </P>
          <Code>
            {
              "### Project Name\n- Desc: Project description\n- Image: https://img-url.png\n- Stack: React, TypeScript, Bun\n- Readme: https://raw.github.com/...\n- Repo: https://github.com/...\n- Product: https://app-url.com"
            }
          </Code>
          <P>
            All fields are optional. You can skip any field you do not have data for. Add as many
            projects as you like.
          </P>

          <HR />

          <H2>tips</H2>
          <P>
            The preview on the right updates as you type so you can see exactly how things will
            look.
          </P>
          <P>Use the save button in the sidebar to save your template and make it live.</P>
          <P>Every save creates a history snapshot you can restore from later.</P>
          <P>Click reset to boilerplate to start fresh with the default template.</P>
        </div>
      </div>
    </div>
  );
};
