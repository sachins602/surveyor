import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { useState } from "react";
import { format } from "date-fns";
import { api } from "@/utils/api";
import { cn } from "@/utils/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { CalendarIcon, Link } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { wrapAsyncFunction } from "@/utils/promise-helper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { NepalProvineAndDistrict } from "public/nepaladministrativezone";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Full Name must be at least 2 characters.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  email: z.string().email({
    message: "Must be a vaild email",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  notify: z.enum(["all", "mentions", "none"], {
    required_error: "You need to select a notification type.",
  }),
  message: z.string().min(3, {
    message: "Description must be at least 10 characters.",
  }),
  province: z.object({
    name: z.enum(["प्रदेश नं. १", "प्रदेश नं. २", "बागमती (प्रदेश नं. ३)", "गण्डकी (प्रदेश नं. ४)", "म्बिनी (प्रदेश नं. ५)", "कर्णाली (प्रदेश नं. ६)", "सूदुरपश्चिम (प्रदेश नं. ७)"]),
    district: z.string(),
    localAdministation: z.string(),
  }),
});

export function SurveyForm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      date: new Date(),
      email: "",
      phone: "",
      notify: "all",
      message: "",
      province: {
      },
    },
  });

  const provinceWatcher = form.watch("province.name");
  const districtWatcher = form.watch("province.district");
  console.log(NepalProvineAndDistrict[provinceWatcher]);
  if (districtWatcher) {
    console.log(NepalProvineAndDistrict[provinceWatcher][districtWatcher]);
  }
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    form.reset();
  }
  return (
    <div>
      <h1>गाउँ तथा नगर वस्तुस्थिति विवरण तयारी कार्यविधि २०७५ मा अाधारित भर्इ गाउँपालिका तथा नगरपालिकाहरूले अाफ्नाे कार्यक्षेत्र भित्रकाे गाउँ तथा नगर वस्तुस्थिति विवरण (Profile) तयार तथा अद्यावधी गर्नकाे लागि घरपरिवार सर्भेक्षण गर्न तयार गरिएकाे घरपरिवार सर्वेक्षण प्रश्नावली २०७५ । तपार्इले दिनु भएकाे जानकारी सूचनाकाे हक अन्तर्गत गाेप्य राखिने छ ।</h1>
      <Form {...form}>
        <form
          onSubmit={wrapAsyncFunction(form.handleSubmit(onSubmit))}
          className="space-y-4 p-2"
        >
          <Accordion className="w-full" type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>१. तथ्यांक व्यवस्थापन?</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१.१. सर्वेक्षण काेडः</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१.२. सर्वेक्षण गरिएकाे मितिः</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१.३. सर्वेक्षण गर्नेकाे नाम</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>२. परिचय</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="province.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.१. प्रदेश नं.</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="प्रदेश छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="प्रदेश नं. १">प्रदेश नं. १</SelectItem>
                          <SelectItem value="प्रदेश नं. २">प्रदेश नं. २</SelectItem>
                          <SelectItem value="बागमती (प्रदेश नं. ३)">बागमती (प्रदेश नं. ३)</SelectItem>
                          <SelectItem value="गण्डकी (प्रदेश नं. ४)">गण्डकी (प्रदेश नं. ४)</SelectItem>
                          <SelectItem value="म्बिनी (प्रदेश नं. ५)">लुम्बिनी (प्रदेश नं. ५)</SelectItem>
                          <SelectItem value="कर्णाली (प्रदेश नं. ६)">कर्णाली (प्रदेश नं. ६)</SelectItem>
                          <SelectItem value="सूदुरपश्चिम (प्रदेश नं. ७)">सूदुरपश्चिम (प्रदेश नं. ७)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        You can choose province
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {provinceWatcher ? <FormField
                  control={form.control}
                  name="province.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.२ जिल्लाहरू</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=" जिल्ला छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(NepalProvineAndDistrict[provinceWatcher]).map((item) => {
                            return <SelectItem key={item} value={item}>{item}</SelectItem>
                          })
                          }
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        You can choose province
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                /> : null}
                {districtWatcher ? <FormField
                  control={form.control}
                  name="province.localAdministation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.३. गाउँपालिका/नगरपालिका</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="गाउँपालिका/नगरपालिका छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NepalProvineAndDistrict[provinceWatcher][districtWatcher].map((item) => {
                            return <SelectItem key={item} value={item}>{item}</SelectItem>
                          })
                          }
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        You can choose province
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                /> : null}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.४. वडा नं.</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.५. वस्तीकाे नाम</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.५.१ घरको क्रम सख्या</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.६. वस्तीकाे CODE</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.७. मार्गकाे नाम (घर छेउकाे बाटाेकाे नाम)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.८. जम्मा परिवार संख्या (परिवार संख्या)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>२.८.१. घर पुग्ने बाटो/ सडकको प्रकार(बाटो छान्नुहोस)</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="all" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              गोरेटो बाटो

                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mentions" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              ग्राभेल बाटो
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="none" />
                            </FormControl>
                            <FormLabel className="font-normal">बाटो नभएकाे</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mentions" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              पक्की बाटो
                            </FormLabel>
                          </FormItem>

                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.९. घरकाे अवस्थिति (जियाेकाेड)</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.१०. उत्तरदाताकाे नामः</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.११ घरमुलीकाे नामः</FormLabel>
                      <FormControl>
                        <Input placeholder="Jhon Doe" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jhon Doe" {...field} />
                </FormControl>

                <FormDescription>Please enter your full name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Meeting Date</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={() => setOpen(false)}
                      onDayClick={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>Choose a date you want to meet.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@email.com" {...field} />
                </FormControl>

                <FormDescription>Please enter your email.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+01 9876543210" {...field} />
                </FormControl>

                <FormDescription>Please enter your phone number.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notify"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Notify me about...</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="all" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        All new messages
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="mentions" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Direct messages and mentions
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="none" />
                      </FormControl>
                      <FormLabel className="font-normal">Nothing</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input placeholder="hello!" {...field} />
                </FormControl>

                <FormDescription>Please enter your message.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
