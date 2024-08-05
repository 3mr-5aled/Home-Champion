import { Dispatch, SetStateAction, FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface DeductionDetails {
  reason: string
  amount: number
}

interface DeductPointsModalProps {
  isDeductOpen: boolean
  setIsDeductOpen: Dispatch<SetStateAction<boolean>>
  deductionDetails: DeductionDetails
  setDeductionDetails: Dispatch<SetStateAction<DeductionDetails>>
  handleDeductPoints: (e: FormEvent<HTMLFormElement>) => void
}

const DeductPointsModal: React.FC<DeductPointsModalProps> = ({
  isDeductOpen,
  setIsDeductOpen,
  deductionDetails,
  setDeductionDetails,
  handleDeductPoints,
}) => (
  <Dialog open={isDeductOpen} onOpenChange={setIsDeductOpen}>
    <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleDeductPoints}>
        <DialogHeader>
          <DialogTitle>Deduct Points</DialogTitle>
          <DialogDescription>
            Enter the details for the points deduction below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reason" className="text-right col-span-1">
              Reason
            </Label>
            <Textarea
              id="reason"
              required
              value={deductionDetails.reason}
              onChange={(e) =>
                setDeductionDetails({
                  ...deductionDetails,
                  reason: e.target.value,
                })
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right col-span-1">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              required
              value={deductionDetails.amount}
              onChange={(e) =>
                setDeductionDetails({
                  ...deductionDetails,
                  amount: Number(e.target.value),
                })
              }
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <button type="submit" className="btn btn-primary custom-btn">
            Deduct Points
          </button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
)

export default DeductPointsModal
