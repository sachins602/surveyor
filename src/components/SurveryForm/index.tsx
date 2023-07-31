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
import { type NepalDistrict, NepalProvinceAndDistrict } from "public/nepaladministrativezone";


const formSchema = z.object({
  surveyManagement: z.object({
    surveyCode: z.number(),
    surveryDate: z.date(),
    surveyorName: z.string(),
  }),
  identity: z.object({
    province: z.object({
      name: z.enum(["कोशी (प्रदेश नं. १)", "मदेश (प्रदेश नं. २)", "बागमती (प्रदेश नं. ३)", "गण्डकी (प्रदेश नं. ४)", "लुम्बिनी (प्रदेश नं. ५", "कर्णाली (प्रदेश नं. ६)", "सूदुरपश्चिम (प्रदेश नं. ७)"]),
      district: z.string(),
      localAdministation: z.string(),
    }),
    ward: z.number(),
    localityName: z.string(),
    houseNumber: z.string(),
    streetName: z.string(),
    familyMembers: z.number(),
    streetType: z.enum(["गोरेटो बाटो", "ग्राभेल बाटो", "बाटो नभएकाे", "पक्की बाटो"]),
    houseGeoCode: z.object({
      latitude: z.string(),
      longitude: z.string(),
      altitude: z.string(),
      accuracy: z.string(),
    }),
    subjectName: z.string(),
    houseOwnerName: z.string(),
    sex: z.enum(["Male", "Female", "Others"]),
    houseOwnerRelation: z.enum(["घरमुली आफै", "श्रीमान/श्रीमती", "अामा/ बुवा", "छोरा वा बुहारी", "छोरी वा ज्वार्इ", "ससुरा वा सासु", "काका वा काकी", "फुफु, फुफाजु", "मामा, माइजु", "नाति, नातिनी", "दाजु, भाइ", "भाउजू वा भाइबुहारी", "दीदि, बिहनी", "ज्वार्इ, जेठान", "ठूलाे बुवा, ठूलाे अामा"], {
      required_error: "You need to select a notification type.",
    }),
    contactNumber: z.number().min(10, {
      message: "Phone number must be at least 10 characters.",
    }),
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
    job: z.enum(["कृषि तथा पशुपालन",
      "नोकरी जागिर",
      "उद्योग व्यापार",
      "ज्याला मजदुरी",
      "व्यवसायिक कार्य (पत्रकार, वकिल, परामर्श, ठेक्का, पुजारी)",
      "बैदेशिक रोजगारी",
      "विद्यार्थी (अध्ययनरत)",
      "गृहिणी",
      "बेरोजगार",
      "कम उमेर",
      "अन्य",
      "पेन्सन",
      "प्राविधिक",
      "बढी उमेर",
      "प्लम्बर",
      "डकर्मी",
      "सीकर्मी",
    ]),
    specialSkill: z.enum(["इन्जिनीयर",
      "चिकित्सक",
      "कानूनविद",
      "कृषि विशेषज्ञ",
      "पशु चिकित्सक",
      "लेखाविद",
      "सन्चारकमी",
      "विशेष सीप नभएका",
      "वन विशेषज्ञ",
      "खाद्यय प्रशोधन विशेषज्ञ",
      "अन्य",
    ]),
    maritalStatus: z.enum(["अविवाहित",
      "एकल बिवाह",
      "बहु बिवाह",
      "पुनः बिवाह",
      "एकल पुरष, एकल महिला",
      "सम्बन्ध बिच्छेद",
      "बिबाहित तर अलग बसेको",
      "उमेर कम",
    ]),
    businessStatus: z.enum(["गणना गरेकै ठाउँमा बसेको",
      "स्वदेशमा अन्यत्र बसेको",
      "बिदेशमा बसेको",
    ]),
    disabilityStatus: z.enum(["सपांग",
      "शारीरिक अपाङ्गता",
      "बौद्धिक अपाङ्गता",
      "दृष्टिसम्बन्धी अपाङ्गता",
      "श्रवण दृष्टिविहीन अपाङ्गता (बहिरा)",
      "स्वर र बोलाइसम्बन्धी अपाङ्गता",
      "सुनुवाइसम्बन्धी अपाङ्गता",
      "मानसिक वा मनोसामाजिक अपाङ्गता",
      "अटिज्मसम्बन्धी अपाङ्गता (सुस्त मनस्थिती­)",
      "बहुअपाङ्गता",
      "अनुवंशीय रक्तश्राव (हेमोफोलिया) सम्बन्धी अपाङ्गता",
    ]),
    healthStatus: z.enum(['']),
    businessTranining: z.enum(["सिलार्इ,बुनार्इ, बुटिक, सृङगार, पार्लर अादि",
      "सूचना तथा प्रबिधि, र्इलेक्ट्रकल, र्इलेक्ट्रनिक्स(कम्प्युटर, विद्युत, माेबाइल, रेडियाे, घडि मर्मत अादि)",
      "निर्माण सम्बन्धी (राज मिस्त्रि, कार्पेन्ट्री अादी)",
      "र्इन्जिनियरिङ,अटाेमाेबाइल र मेकानिक्स",
      "कृषि सम्बन्धी (जेटी, जेटिए र खाद्य प्रशाेधन अादि)",
      "जनस्वास्थ्य सम्बन्धी",
      "पशुस्वास्थ्य सम्बन्धी",
      "पर्यटन, टुर गाइड, ट्राभल र सत्कारकला सम्बन्धी",
      "अन्य",
      "तालिम लिएकाे छैन",
    ]),
    trainingTime: z.enum(['']),
    socialSecurity: z.enum(["लिन नमिल्ने",
      "बृद्घा भत्ता",
      "विधवा भत्ता",
      "एकल भत्ता",
      "अपांग भत्ता",
      "पोषण भत्ता",
      "लोपोन्मुख समुह भत्ता",
      "भत्ता नलिएका",
    ])
  }),
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
  type: z.enum(["male", "female", "others"], {
    required_error: "You need to select a notification type.",
  }),

  familyBankStatus: z.enum(["छ", "छैन",]),
  familyBankDetail: z.enum(["बैंक", "लगुवित्तीय", "सहकारी",]),
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
      identity: {
        province: {},
      },
    },
  });

  const { fields: familyFields, append: familyAppend, remove: familyRemove } = useFieldArray<z.infer<typeof formSchema>>({
    control: form.control,
    name: "familyDetails" as never,
  });

  const addressWatcher = form.watch("identity.province");

  useEffect(() => {
    form.setValue("identity.province.district", "");

  }, [addressWatcher.name, form]);

  useEffect(() => {
    form.setValue("identity.province.localAdministation", "");
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
          <Accordion className="w-full" type="multiple" >
            <AccordionItem value="item-1">
              <AccordionTrigger>१. तथ्यांक व्यवस्थापन?</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="surveyManagement.surveyCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१.१. सर्वेक्षण काेडः</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
                      </FormControl>

                      <FormDescription>Please enter your full name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surveyManagement.surveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>१.२. सर्वेक्षण गरिएकाे मितिः</FormLabel>
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
                                <span>मिति छान्नुहोस</span>
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
                      <FormDescription>Choose a date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="surveyManagement.surveyorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१.३. सर्वेक्षण गर्नेकाे नाम</FormLabel>
                      <FormControl>
                        <Input placeholder="Ashis Poudel" {...field} />
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
                  name="identity.province.name"
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
                          <SelectItem value="कोशी (प्रदेश नं. १)">कोशी (प्रदेश नं. १)</SelectItem>
                          <SelectItem value="मदेश (प्रदेश नं. २)">मदेश (प्रदेश नं. २)</SelectItem>
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
                  name="identity.province.district"
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
                {addressWatcher.district && NepalProvinceAndDistrict[addressWatcher.name][addressWatcher.district as NepalDistrict] && <FormField
                  control={form.control}
                  name="identity.province.localAdministation"
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
                          {Object.values(NepalProvinceAndDistrict[addressWatcher.name][addressWatcher.district as NepalDistrict] as string[]).map((item) => {
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
                  name="identity.ward"
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
                  name="identity.localityName"
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
                  name="identity.houseNumber"
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
                  name="identity.streetName"
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
                  name="identity.familyMembers"
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
                  name="identity.streetType"
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
                    name="identity.houseGeoCode.latitude"
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
                    name="identity.houseGeoCode.longitude"
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
                    name="identity.houseGeoCode.altitude"
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
                    name="identity.houseGeoCode.accuracy"
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
                  name="identity.houseOwnerRelation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>२.१२  घरमुलीकाे के नाता पर्ने हाे ?</FormLabel>
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

                {familyFields.map((item, index) => {
                  return (
                    <div key={item.id} className="space-y-4">
                      <p>परिवारका सदस्यहरुको विवरण (घरमुलीबाट शुरु गर्ने र जेष्ठ सदस्य अनुसार क्रम मिलाएर उल्लेख गर्ने)</p>
                      <Button onClick={() => familyRemove(index)}>Remove</Button>
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
                      <FormField
                        control={form.control}
                        name="familyDetails.language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>बाेल्ने भाषा</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="मैथिली">मैथिली</SelectItem>
                                <SelectItem value="भाेजपुरी">भाेजपुरी</SelectItem>
                                <SelectItem value="थारू">थारू</SelectItem>
                                <SelectItem value="हिन्दी">हिन्दी</SelectItem>
                                <SelectItem value="उर्दु">उर्दु</SelectItem>
                                <SelectItem value="बान्तवा">बान्तवा</SelectItem>
                                <SelectItem value="चाम्लिङ">चाम्लिङ</SelectItem>
                                <SelectItem value="लिम्बु">लिम्बु</SelectItem>
                                <SelectItem value="तामाङ">तामाङ</SelectItem>
                                <SelectItem value="डाेटेली">डाेटेली</SelectItem>
                                <SelectItem value="खस">खस</SelectItem>
                                <SelectItem value="झागड (उराउ)">झागड (उराउ)</SelectItem>
                                <SelectItem value="अन्य">अन्य</SelectItem>
                                <SelectItem value="मगर">मगर</SelectItem>
                                <SelectItem value="अवधी">अवधी</SelectItem>
                                <SelectItem value="गुरुङ">गुरुङ</SelectItem>
                                <SelectItem value="नेवारी">नेवारी</SelectItem>
                                <SelectItem value="कछडिया">कछडिया</SelectItem>
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
                        name="familyDetails.religion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>धर्म</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="हिन्दु">हिन्दु</SelectItem>
                                <SelectItem value="बौद्ध">बौद्ध</SelectItem>
                                <SelectItem value="इस्लाम">इस्लाम</SelectItem>
                                <SelectItem value="ईसाई">ईसाई</SelectItem>
                                <SelectItem value="अन्य">अन्य</SelectItem>
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
                        name="familyDetails.education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>शैक्षिक याेग्यता</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="पूर्व प्रथमिक">पूर्व प्रथमिक</SelectItem>
                                <SelectItem value="अाधारभूत तह">अाधारभूत तह</SelectItem>
                                <SelectItem value="माध्यिमक">माध्यिमक</SelectItem>
                                <SelectItem value="तहस्नातक तह">तहस्नातक तह</SelectItem>
                                <SelectItem value="स्नातकोत्तर तह">स्नातकोत्तर तह</SelectItem>
                                <SelectItem value="प्राविधिक">प्राविधिक</SelectItem>
                                <SelectItem value="एसलसि">एसलसि</SelectItem>
                                <SelectItem value="साधारण लेखपढ">साधारण लेखपढ</SelectItem>
                                <SelectItem value="निरक्षर">निरक्षर</SelectItem>
                                <SelectItem value="उमेर कम">उमेर कम</SelectItem>
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
                        name="familyDetails.job"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>पेशा</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="कृषि तथा पशुपालन">कृषि तथा पशुपालन</SelectItem>
                                <SelectItem value="नोकरी जागिर">नोकरी जागिर</SelectItem>
                                <SelectItem value="उद्योग व्यापार">उद्योग व्यापार</SelectItem>
                                <SelectItem value="ज्याला मजदुरी">ज्याला मजदुरी</SelectItem>
                                <SelectItem value="व्यवसायिक कार्य (पत्रकार, वकिल, परामर्श, ठेक्का, पुजारी)">व्यवसायिक कार्य (पत्रकार, वकिल, परामर्श, ठेक्का, पुजारी)</SelectItem>
                                <SelectItem value="बैदेशिक रोजगारी">बैदेशिक रोजगारी</SelectItem>
                                <SelectItem value="विद्यार्थी (अध्ययनरत)">विद्यार्थी (अध्ययनरत)</SelectItem>
                                <SelectItem value="गृहिणी">गृहिणी</SelectItem>
                                <SelectItem value="बेरोजगार">बेरोजगार</SelectItem>
                                <SelectItem value="कम उमेर">कम उमेर</SelectItem>
                                <SelectItem value="अन्य">अन्य</SelectItem>
                                <SelectItem value="पेन्सन">पेन्सन</SelectItem>
                                <SelectItem value="प्राविधिक">प्राविधिक</SelectItem>
                                <SelectItem value="बढी उमेर">बढी उमेर</SelectItem>
                                <SelectItem value="प्लम्बर">प्लम्बर</SelectItem>
                                <SelectItem value="डकर्मी">डकर्मी</SelectItem>
                                <SelectItem value="सीकर्मी">सीकर्मी</SelectItem>
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
                        name="familyDetails.specialSkill"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>तपाईको विषेश सीप के छ ?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="इन्जिनीयर">इन्जिनीयर</SelectItem>
                                <SelectItem value="चिकित्सक">चिकित्सक</SelectItem>
                                <SelectItem value="कानूनविद">कानूनविद</SelectItem>
                                <SelectItem value="कृषि विशेषज्ञ">कृषि विशेषज्ञ</SelectItem>
                                <SelectItem value="पशु चिकित्सक">पशु चिकित्सक</SelectItem>
                                <SelectItem value="लेखाविद">लेखाविद</SelectItem>
                                <SelectItem value="सन्चारकमी">सन्चारकमी</SelectItem>
                                <SelectItem value="विशेष सीप नभएका">विशेष सीप नभएका</SelectItem>
                                <SelectItem value="वन विशेषज्ञ">वन विशेषज्ञ</SelectItem>
                                <SelectItem value="खाद्यय प्रशोधन विशेषज्ञ">खाद्यय प्रशोधन विशेषज्ञ</SelectItem>
                                <SelectItem value="अन्य">अन्य</SelectItem>
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
                        name="familyDetails.maritalStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>बैवाहिक स्थिति</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="अविवाहित">अविवाहित</SelectItem>
                                <SelectItem value="एकल बिवाह">एकल बिवाह</SelectItem>
                                <SelectItem value="बहु बिवाह">बहु बिवाह</SelectItem>
                                <SelectItem value="पुनः बिवाह">पुनः बिवाह</SelectItem>
                                <SelectItem value="एकल पुरष, एकल महिला">एकल पुरष, एकल महिला</SelectItem>
                                <SelectItem value="सम्बन्ध बिच्छेद">सम्बन्ध बिच्छेद</SelectItem>
                                <SelectItem value="बिबाहित तर अलग बसेको">बिबाहित तर अलग बसेको</SelectItem>
                                <SelectItem value="उमेर कम">उमेर कम</SelectItem>
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
                        name="familyDetails.businessStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>बसाेबासकाे अवस्था</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="गणना गरेकै ठाउँमा बसेको">गणना गरेकै ठाउँमा बसेको</SelectItem>
                                <SelectItem value="स्वदेशमा अन्यत्र बसेको">स्वदेशमा अन्यत्र बसेको</SelectItem>
                                <SelectItem value="बिदेशमा बसेको">बिदेशमा बसेको</SelectItem>
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
                        name="familyDetails.disabilityStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>अपांगता स्थिति</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="सपांग">सपांग</SelectItem>
                                <SelectItem value="शारीरिक अपाङ्गता">शारीरिक अपाङ्गता</SelectItem>
                                <SelectItem value="बौद्धिक अपाङ्गता">बौद्धिक अपाङ्गता</SelectItem>
                                <SelectItem value="दृष्टिसम्बन्धी अपाङ्गता">दृष्टिसम्बन्धी अपाङ्गता</SelectItem>
                                <SelectItem value="श्रवण दृष्टिविहीन अपाङ्गता (बहिरा)">श्रवण दृष्टिविहीन अपाङ्गता (बहिरा)</SelectItem>
                                <SelectItem value="स्वर र बोलाइसम्बन्धी अपाङ्गता">स्वर र बोलाइसम्बन्धी अपाङ्गता</SelectItem>
                                <SelectItem value="सुनुवाइसम्बन्धी अपाङ्गता">सुनुवाइसम्बन्धी अपाङ्गता</SelectItem>
                                <SelectItem value="मानसिक वा मनोसामाजिक अपाङ्गता">मानसिक वा मनोसामाजिक अपाङ्गता</SelectItem>
                                <SelectItem value="अटिज्मसम्बन्धी अपाङ्गता (सुस्त मनस्थिती­)">अटिज्मसम्बन्धी अपाङ्गता (सुस्त मनस्थिती­)</SelectItem>
                                <SelectItem value="बहुअपाङ्गता">बहुअपाङ्गता</SelectItem>
                                <SelectItem value="अनुवंशीय रक्तश्राव (हेमोफोलिया) सम्बन्धी अपाङ्गता">अनुवंशीय रक्तश्राव (हेमोफोलिया) सम्बन्धी अपाङ्गता</SelectItem>

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
                        name="familyDetails.healthStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>स्वास्थ्य स्थिति</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="स्वस्थ">स्वस्थ</SelectItem>
                                {/* Todo */}
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
                        name="familyDetails.businessTranining"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>व्यवसायिक तालिमको अवस्था</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="सिलार्इ,बुनार्इ, बुटिक, सृङगार, पार्लर अादि">सिलार्इ,बुनार्इ, बुटिक, सृङगार, पार्लर अादि</SelectItem>
                                <SelectItem value="सूचना तथा प्रबिधि, र्इलेक्ट्रकल, र्इलेक्ट्रनिक्स(कम्प्युटर, विद्युत, माेबाइल, रेडियाे, घडि मर्मत अादि)">सूचना तथा प्रबिधि, र्इलेक्ट्रकल, र्इलेक्ट्रनिक्स(कम्प्युटर, विद्युत, माेबाइल, रेडियाे, घडि मर्मत अादि)</SelectItem>
                                <SelectItem value="निर्माण सम्बन्धी (राज मिस्त्रि, कार्पेन्ट्री अादी)">निर्माण सम्बन्धी (राज मिस्त्रि, कार्पेन्ट्री अादी)</SelectItem>
                                <SelectItem value="र्इन्जिनियरिङ,अटाेमाेबाइल र मेकानिक्स">र्इन्जिनियरिङ,अटाेमाेबाइल र मेकानिक्स</SelectItem>
                                <SelectItem value="कृषि सम्बन्धी (जेटी, जेटिए र खाद्य प्रशाेधन अादि)">कृषि सम्बन्धी (जेटी, जेटिए र खाद्य प्रशाेधन अादि)</SelectItem>
                                <SelectItem value="जनस्वास्थ्य सम्बन्धी">जनस्वास्थ्य सम्बन्धी</SelectItem>
                                <SelectItem value="पशुस्वास्थ्य सम्बन्धी">पशुस्वास्थ्य सम्बन्धी</SelectItem>
                                <SelectItem value="पर्यटन, टुर गाइड, ट्राभल र सत्कारकला सम्बन्धी">पर्यटन, टुर गाइड, ट्राभल र सत्कारकला सम्बन्धी</SelectItem>
                                <SelectItem value="अन्य">अन्य</SelectItem>
                                <SelectItem value="तालिम लिएकाे छैन">तालिम लिएकाे छैन</SelectItem>
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
                        name="familyDetails.trainingTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>तालिमको अबधि ?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* Todo */}
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
                        name="familyDetails.socialSecurity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>सामाजिक सुरक्षा भत्ताको अवस्था ?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="उत्तर छान्नुहोस" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="लिन नमिल्ने">लिन नमिल्ने</SelectItem>
                                <SelectItem value="बृद्घा भत्ता">बृद्घा भत्ता</SelectItem>
                                <SelectItem value="विधवा भत्ता">विधवा भत्ता</SelectItem>
                                <SelectItem value="एकल भत्ता">एकल भत्ता</SelectItem>
                                <SelectItem value="अपांग भत्ता">अपांग भत्ता</SelectItem>
                                <SelectItem value="पोषण भत्ता">पोषण भत्ता</SelectItem>
                                <SelectItem value="लोपोन्मुख समुह भत्ता">लोपोन्मुख समुह भत्ता</SelectItem>
                                <SelectItem value="भत्ता नलिएका">भत्ता नलिएका</SelectItem>
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
                  familyAppend({});
                }}>
                  Add
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>४. बिमा सम्बन्धी जानकारी</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>४.१. तपार्इकाे परिवारकाे कुनै सदस्यकाे बिमा गरेकाे छ कि छैन ?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="जीवन बिमा गरेकाे छ ।" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              जीवन बिमा गरेकाे छ ।
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="स्वास्थ्य बिमा गरेकाे छ ।" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              स्वास्थ्य बिमा गरेकाे छ ।
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="अन्य बिमा गरेकाे छ ।" />
                            </FormControl>
                            <FormLabel className="font-normal">अन्य बिमा गरेकाे छ ।</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="कुनै पनि गरेकाे छैन ।" />
                            </FormControl>
                            <FormLabel className="font-normal">कुनै पनि गरेकाे छैन ।</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>५.</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>५. तपाईको घरमा कस्तो नून प्रयोग गर्नु हुन्छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>५.१.१. तपाईको घरबाट हिडेर नजिकको बजार पुग्न कति समय लाग्छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>५.१.२. घरमा विरामी परेमा सबैभन्दा पहिले कहाँ जानु हुन्छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>५.१.३. तपाईको घरबाट अस्पताल पुग्न कति समय लाग्छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>५.१.४. तपाईको घरमा १६ बर्ष मुनिको (बालबालिका) कोही काम गर्न बसेको छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
            <AccordionItem value="item-6">
              <AccordionTrigger>६. सेवा सुविधाहरूकाे विवरण</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>६.१. तपार्इकाे घरकाे खानेपानीकाे मुख्य श्राेत के हाे ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>६.२. तपार्इकाे घरमा खाना पकाउन प्रयाेग गर्ने मुख्य इन्धन केहाे ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>६.३. तपार्इकाे घरमा प्रयाेग हुने बत्तिकाे श्राेत के हाे ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>६.४ तपार्इकाे परिवारले प्रयाेग गर्ने शाैचालय कस्ताे छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
            <FormField
              control={form.control}
              name="notify"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>७. तपार्इकाे घरमा के के सामग्री छन्</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="रेडियाे" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          रेडियाे
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="टेलिभिजन" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          टेलिभिजन
                        </FormLabel>
                      </FormItem>
                      {/* Todo */}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AccordionItem value="item-7">
              <AccordionTrigger>८.</AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={form.control}
                  name="notify"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>८. तपार्इकाे परिवारले कृषि कार्यकाे लागि जग्गा उपभाेग गरेकाे छ कि छैन ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        You can choose province
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* nest these */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>८.१.१. जग्गा उपभोग गर्नुभएको भए आफ्नो परिवारको नाममा (नम्बरी जग्गा) कति जग्गा छ ?</FormLabel>
                      <FormControl>
                        <Input placeholder="1" {...field} />
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
                      <FormLabel>८.१.२.१ ऐलानी जग्गा पनि कमाउनु भएको भए कती छ ? (राेपनी या कठ्ठामा भन्नुहाेस) ।</FormLabel>
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
                      <FormLabel>८.१.२. आंकडा जग्गा पनि कमाउनु भएको भए कति छ ? (रोपनी वा कठ्ठामा भन्नुहोस) ।</FormLabel>
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
                      <FormLabel>८.१.२. अाफ्नाे बाहेक अरूकाे जग्गा पनि कमाउनु भएकाे भए कति छ ? (राेपनी वा कठ्ठामा भन्नुहाेस ) ।</FormLabel>
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
                      <FormLabel>८.१.३. अन्य स्वामित्वकाे जग्गा पनि कमाउनु भएकाे भए कति छ ? (राेपनी वा कठ्ठामा भन्नुहाेस) ।</FormLabel>
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
                      <FormLabel>८.१.४. तपाईको परिवारले उपभोग गर्ने जमिन मध्ये खेत कति छ ?(राेपनीमा भन्नुहाेस)</FormLabel>
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
                      <FormLabel>८.१.५. तपाईको परिवारले उपभोग गर्ने जमिन मध्ये बारी कति छ ? (राेपनीमा भन्नुहाेस)</FormLabel>
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
                      <FormLabel>८.१.६. तपाईको खेतमा सिंचाई सुविधा छ कि छैन ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* Todo */}
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>८.१.८. खेती नगरि बाझो रहेको जमिन कति छ ?(राेपनीमा वा कठ्ठा वा हेक्टर वा व.मि.भन्नुहाेस)</FormLabel>
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
            <AccordionItem value="item-8">
              <AccordionTrigger>१७. अार्थिक क्षेत्रकाे जानकारी</AccordionTrigger>
              <AccordionContent>

                <FormField
                  control={form.control}
                  name="familyBankStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१७.१. परिवारकाे कुनै सदस्यकाे बैंक तथा वित्तीय संस्थामा खाता छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="छ">छ</SelectItem>
                          <SelectItem value="छैन">छैन</SelectItem>
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
                  name="familyBankStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>१७.१.१.१. तपाईको परिवारका सदस्यकाे बैंक तथा वित्तीय संस्थामा खाता छ भने कहाँ छ ?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="उत्तर छान्नुहोस" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="बैंक">बैंक</SelectItem>
                          <SelectItem value="लगुवित्तीय">लगुवित्तीय</SelectItem>
                          <SelectItem value="सहकारी">सहकारी</SelectItem>
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
