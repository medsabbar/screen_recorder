import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="flex flex-col space-y-4 items-center justify-center py-6 w-full shrink-0 bg-gray-100 dark:bg-gray-900 px-4 md:px-6 border-t">
      <div className="grid gap-0.5 text-xs">
        <div className="font-medium">Mohamed Sabbar</div>
        <a
          className="text-gray-500 dark:text-gray-400"
          href="mailto:med1sabar@gmail.com"
        >
          med1sabar@gmail.com
        </a>
      </div>
      <div className="flex items-center space-x-4">
        <a
          className="text-gray-500 hover:text-gray-600 dark:hover:text-white"
          href="https://github.com/medsabbar"
        >
          <FaGithub className="h-6 w-6" />
        </a>
        <a
          className="text-gray-500 hover:text-gray-600 dark:hover:text-white"
          href="https://www.linkedin.com/in/med1sabar/"
        >
          <FaLinkedin className="h-6 w-6" />
        </a>
      </div>
    </footer>
  );
}
