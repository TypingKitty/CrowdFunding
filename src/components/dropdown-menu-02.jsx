import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, User } from "lucide-react";

export default function DropdownMenuWithIcon(address,balance) {
  return (
    (<DropdownMenu>
      <DropdownMenuTrigger
        className="focus:outline-none focus:ring-[2px] focus:ring-offset-2 focus:ring-primary rounded-full">
        <Avatar>
          <AvatarFallback><User/></AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-5 flex flex-col space-4">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="h-4 w-4" /> {address}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Wallet className="h-4 w-4" /> {balance} ETH
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenu>)
  );
}
