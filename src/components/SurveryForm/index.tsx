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
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useFieldArray, useForm } from "react-hook-form";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { wrapAsyncFunction } from "@/utils/promise-helper";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import { type NepalProvince, NepalProvinceAndDistrict } from "public/nepaladministrativezone";

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
    name: z.enum(["प्रदेश नं. १", "प्रदेश नं. २", "बागमती (प्रदेश नं. ३)", "गण्डकी (प्रदेश नं. ४)", "लुम्बिनी (प्रदेश नं. ५", "कर्णाली (प्रदेश नं. ६)", "सूदुरपश्चिम (प्रदेश नं. ७)"]),
    district: z.string(),
    localAdministation: z.string(),
  }),
  type: z.enum(["male", "female", "others"], {
    required_error: "You need to select a notification type.",
  }),
  houseOwnerRelation: z.enum(["घरमुली आफै", "श्रीमान/श्रीमती", "अामा/ बुवा", "छोरा वा बुहारी", "छोरी वा ज्वार्इ", "ससुरा वा सासु", "काका वा काकी", "फुफु, फुफाजु", "मामा, माइजु", "नाति, नातिनी", "दाजु, भाइ", "भाउजू वा भाइबुहारी", "दीदि, बिहनी", "ज्वार्इ, जेठान", "ठूलाे बुवा, ठूलाे अामा"], {
    required_error: "You need to select a notification type.",
  }),
  familyDetails: z.object({
    firstName: z.string(),
    lastName: z.string(),
    sex: z.enum(["male", "female", "others"]),
    relationToHouseOwner: z.enum([
      "घरमुली आफै",
      "श्रीमान/श्रीमती",
      "अामा/ बुवा",
      "छोरा वा बुहारी",
      "छोरी वा ज्वार्इ",
      "ससुरा वा सासु",
      "काका वा काकी",
      "फुफु, फुफाजु",
      "मामा, माइजु",
      "नाति, नातिनी",
      "दाजु, भाइ",
      "भाउजू वा भाइबुहारी",
      "दीदि, बिहनी",
      "ज्वार्इ, जेठान",
      "ठूलाे बुवा, ठूलाे अामा",
    ]),
    age: z.number(),
    ethnicGroup: z.enum([
      "पहाडी ब्राह्मण, क्षेत्री, ठकुरी",
      "तराई ब्राह्मण, राजपुत",
      "पहाडी अादिवासी जनजाति",
      "तरार्इ अादिवासी जनजाति",
      "पहाडी दलित",
      "तरार्इ दलित",
      "मुस्लिम",
      "पहाडी अन्य",
      "तरार्इ अन्य",
      "लोपन्मुख",
    ]),
    language: z.enum(["नेपाली",
      "मैथिली",
      "भाेजपुरी",
      "थारू",
      "हिन्दी",
      "उर्दु",
      "बान्तवा",
      "चाम्लिङ",
      "लिम्बु",
      "तामाङ",
      "डाेटेली",
      "खस",
      "झागड (उराउ)",
      "अन्य",
      "मगर",
      "अवधी",
      "गुरुङ",
      "नेवारी",
      "कछडिया",]),
    religion: z.enum([
      "हिन्दु",
      "बाैद्द",
      "र्इस्लाम (मुस्लिम)",
      "इसार्इ (क्रिस्चियन)",
      "किरात",
      "जैन",
      "अन्य",]),
    education: z.enum([
      "पूर्व प्रथमिक",
      "अाधारभूत तह",
      "माध्यिमक",
      "तहस्नातक तह",
      "स्नातकोत्तर तह",
      "प्राविधिक",
      "एसलसि",
      "साधारण लेखपढ",
      "निरक्षर",
      "उमेर कम",]),
  }),
});

export function SurveyForm() {
  const [open, setOpen] = useState(false);

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

  const { fields, append, remove } = useFieldArray<z.infer<typeof formSchema>>({
    control: form.control,
    name: "familyDetails" as never,
  });

  const addressWatcher = form.watch("province");

  useEffect(() => {
    form.setValue("province.district", "");

  }, [addressWatcher.name, form]);

  useEffect(() => {
    form.setValue("province.localAdministation", "");
  }, [addressWatcher.district, form]);


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
                          <SelectItem value="लुम्बिनी (प्रदेश नं. ५">लुम्बिनी (प्रदेश नं. ५)</SelectItem>
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
                {addressWatcher.name && <FormField
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
                          {Object.keys(NepalProvinceAndDistrict[addressWatcher.name]).map((item) => {
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
                />}
                {addressWatcher.district && NepalProvinceAndDistrict[addressWatcher.name][addressWatcher.district] && <FormField
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
                          {/* {NepalProvinceAndDistrict[addressWatcher.name][addressWatcher.district].map((item: string) => {
                            return <SelectItem key={item} value={item}>{item}</SelectItem>
                          })
                          } */}
                          {Object.values(NepalProvinceAndDistrict[addressWatcher.name][addressWatcher.district] as string[]).map((item) => {
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
                />}
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
                    <FormItem>
                      <FormLabel>२.८.१. घर पुग्ने बाटो/ सडकको प्रकार</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="बाटो छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="गोरेटो बाटो"> गोरेटो बाटो</SelectItem>
                          <SelectItem value="ग्राभेल बाटो">ग्राभेल बाटो</SelectItem>
                          <SelectItem value="बाटो नभएकाे">बाटो नभएकाे</SelectItem>
                          <SelectItem value="पक्की बाटो">पक्की बाटो</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        You can choose street type
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid w-full grid-cols-2">
                  <p>२.९. घरकाे अवस्थिति (जियाेकाेड)</p>
                  <Button>Get Current Location</Button>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude (x.y°)</FormLabel>
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
                        <FormLabel>Longitude (x.y°)</FormLabel>
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
                        <FormLabel>Altitude</FormLabel>
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
                        <FormLabel>
                          Accuracy</FormLabel>
                        <FormControl>
                          <Input placeholder="Jhon Doe" {...field} />
                        </FormControl>

                        <FormDescription>Please enter your full name.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>२.११.१  काे लिंग के हाे ?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="male" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Male
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="female" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Female
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="others" />
                            </FormControl>
                            <FormLabel className="font-normal">Others</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="houseOwnerRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.१. प्रदेश नं.</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="घरमुली आफै">घरमुली आफै</SelectItem>
                          <SelectItem value="श्रीमान/श्रीमती">श्रीमान/श्रीमती</SelectItem>
                          <SelectItem value="अामा/ बुवा">अामा/ बुवा</SelectItem>
                          <SelectItem value="छोरा वा बुहारी">छोरा वा बुहारी</SelectItem>
                          <SelectItem value="छोरी वा ज्वार्इ">छोरी वा ज्वार्इ</SelectItem>
                          <SelectItem value="ससुरा वा सासु">ससुरा वा सासु</SelectItem>
                          <SelectItem value="काका वा काकी">काका वा काकी</SelectItem>
                          <SelectItem value="फुफु, फुफाजु">फुफु, फुफाजु</SelectItem>
                          <SelectItem value="मामा, माइजु">मामा, माइजु</SelectItem>
                          <SelectItem value="नाति, नातिनी">नाति, नातिनी</SelectItem>
                          <SelectItem value="दाजु, भाइ">दाजु, भाइ</SelectItem>
                          <SelectItem value="भाउजू वा भाइबुहारी">भाउजू वा भाइबुहारी</SelectItem>
                          <SelectItem value="दीदि, बिहनी">दीदि, बिहनी</SelectItem>
                          <SelectItem value="ज्वार्इ, जेठान">ज्वार्इ, जेठान</SelectItem>
                          <SelectItem value="ठूलाे बुवा, ठूलाे अामा">ठूलाे बुवा, ठूलाे अामा</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        You can choose province
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>३. पारिवारिक बिवरण</AccordionTrigger>
              <AccordionContent>

                {fields.map((item, index) => {
                  return (
                    <div key={item.id} className="space-y-4">
                      <p>परिवारका सदस्यहरुको विवरण (घरमुलीबाट शुरु गर्ने र जेष्ठ सदस्य अनुसार क्रम मिलाएर उल्लेख गर्ने)</p>
                      <Button onClick={() => remove(index)}>Remove</Button>
                      <FormField
                        control={form.control}
                        name={`familyDetails.${index}.firstName` as never}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>३.१. नाम</FormLabel>
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
                        name={`familyDetails.${index}.lastName` as never}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>३.२. थर</FormLabel>
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
                        name="type"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>लिंग</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="male" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Male
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="female" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Female
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="others" />
                                  </FormControl>
                                  <FormLabel className="font-normal">Others</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="familyDetails.relationToHouseOwner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>२.१. प्रदेश नं.</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="घरमुली आफै">घरमुली आफै</SelectItem>
                                <SelectItem value="श्रीमान/श्रीमती">श्रीमान/श्रीमती</SelectItem>
                                <SelectItem value="अामा/ बुवा">अामा/ बुवा</SelectItem>
                                <SelectItem value="छोरा वा बुहारी">छोरा वा बुहारी</SelectItem>
                                <SelectItem value="छोरी वा ज्वार्इ">छोरी वा ज्वार्इ</SelectItem>
                                <SelectItem value="ससुरा वा सासु">ससुरा वा सासु</SelectItem>
                                <SelectItem value="काका वा काकी">काका वा काकी</SelectItem>
                                <SelectItem value="फुफु, फुफाजु">फुफु, फुफाजु</SelectItem>
                                <SelectItem value="मामा, माइजु">मामा, माइजु</SelectItem>
                                <SelectItem value="नाति, नातिनी">नाति, नातिनी</SelectItem>
                                <SelectItem value="दाजु, भाइ">दाजु, भाइ</SelectItem>
                                <SelectItem value="भाउजू वा भाइबुहारी">भाउजू वा भाइबुहारी</SelectItem>
                                <SelectItem value="दीदि, बिहनी">दीदि, बिहनी</SelectItem>
                                <SelectItem value="ज्वार्इ, जेठान">ज्वार्इ, जेठान</SelectItem>
                                <SelectItem value="ठूलाे बुवा, ठूलाे अामा">ठूलाे बुवा, ठूलाे अामा</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              You can choose province
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="familyDetails.age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>उमेर (सर्वेक्षण गर्दा)</FormLabel>
                            <FormControl>
                              <Input placeholder="2" {...field} />
                            </FormControl>

                            <FormDescription>Please enter your age.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="familyDetails.ethnicGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>जातिगत समूह</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="पहाडी अादिवासी जनजाति">पहाडी अादिवासी जनजाति</SelectItem>
                                <SelectItem value="तरार्इ अादिवासी जनजाति">तरार्इ अादिवासी जनजाति</SelectItem>
                                <SelectItem value="पहाडी दलित">पहाडी दलित</SelectItem>
                                <SelectItem value="तरार्इ दलित">तरार्इ दलित</SelectItem>
                                <SelectItem value="मुस्लिम">मुस्लिम</SelectItem>
                                <SelectItem value="पहाडी अन्य">पहाडी अन्य</SelectItem>
                                <SelectItem value="तरार्इ अन्य">तरार्इ अन्य</SelectItem>
                                <SelectItem value="लोपन्मुख">लोपन्मुख</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              You can choose province
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )
                })}
                <Button onClick={(e) => {
                  e.preventDefault();
                  append({});
                }}>
                  Add
                </Button>
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
