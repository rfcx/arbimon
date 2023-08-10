export const faqList: Array<{ question: string, answer: string }> = [
  {
    question: 'Why is arbimon free?',
    answer: `We know that protecting biodiversity is critical to our future and we believe that biodiversity monitoring needs to be free and open to lead to impact. Rainforest Connection is committed to funding responsible scientific research on Arbimon through partnership, grants, fellowships and research networks. Since we are a non-for-profit, we rely on organizations such as governmental agencies, companies doing research and development, and non-profit foundations to provide the funding for implementing conservation projects, developing new analytical tools, curating our species databases, and improving and supporting the platform. Additionally, anyone can be public donors who support our numerous initiatives such as [protecting endangered species](/featured/biodiversity-baselines), [reforestation and restoration](/featured/restoration), and [establishing biodiversity baseline](/featured/biodiversity-baselines).

If you find our services helpful to you, we invite you to join our mission to monitor, protect and conserve biodiversity around the world. There are some simple steps (like citing Arbimon) that would make a huge difference. Learn more about [how you can contribute](#how-can-i-contribute-to-arbimon).`
  },
  {
    question: 'Is it really unlimited storage and analysis?',
    answer: `Yes! With a free account, you can store as many files and run as many analyses as you want. However, there are some technical limits in terms of file and job size. For storage, the platform will not accept single files over 200MB.

For some analyses (e.g. Pattern Matching, Random Forest), you can create jobs of any size, but others (e.g. Audio Event Detection and Clustering) have a cap on the number of recordings or data points that can be analyzed in a single job. You can see the limits in the table below. We have introduced a cap because it enables us to provide sufficient resources and cover the costs of running analyses for all projects. Learn more about [the cost of running analysis jobs](#how-much-does-it-cost-to-run-a-job).

| Analysis                           | Cap                               |
|------------------------------------|-----------------------------------|
| Audio Event Detection + Clustering | Maximum 2,000 recordings per job  |
| Pattern Matching                   | Unlimited                         |
| Random Forest                      | Unlimited                         |
| Soundscapes                        | Maximum 50,000 recordings per job |`
  },
  {
    question: 'How much does it cost to run a job',
    answer: `For you, it's nothing!

For us, the main factor contributing to job cost is the number of recordings included in the analysis (the playlist size). A job on a playlist containing 1,000 recordings typically costs between 20c and $1 depending on the analysis type. We are currently funding the cost through donations and sponsorship, for more information see [how we make Arbimon free](#why-is-arbimon-free).

As an environmental organization, we would like to minimize both the monetary cost and the energy cost of running analysis jobs. We request that users act responsibly to only run analysis over the minimum dataset and that they perform tests on smaller datasets (e.g. less than 1000 recordings) to gain confidence before running on larger datasets. This will not only help us to keep the platform free for everyone, but also reduce the carbon footprint on conducting ecological analyses.`
  },
  {
    question: 'Do I need to keep a backup of my audio data?',
    answer: 'Audio data is stored securely by our cloud provider which has a service level agreement to maintain 99.9% availability. However, if your data is critical then we recommend that you keep your own backup.'
  },
  {
    question: 'How can I contribute to Arbimon?',
    answer: `If you are publishing scientific work, offering workshops and talks, then please [cite Arbimon](#how-should-arbimon-be-cited). Other ways you can contribute include:

- [Reach out](/contact) to our team to collaborate (e.g. partner with us in a project proposal, [see our past partnership project here](/featured)).
- Make your project insights public - Public projects enable open collaboration, which is essential to to improve ecological knowledge and conservation efforts, facilitate break through discoveries and share insights and findings with the world. We take your data privacy seriously. We will never share and divulge sensitive information from the users and datasets, and you can decide on what data you are sharing. [Learn more about our data privacy here](https://rfcx.org/privacy-policy).
- Share your work on social media with us by tagging our accounts, and using the hashtags: #arbimon, #rainforestcx, #usingtechtoprotect.
- [Donate](https://rfcx.org/?form=give) to Rainforest Connection to support maintaining the platform and adding new features.`
  },
  {
    question: 'How should Arbimon be cited?',
    answer: `Our preferred publication for references is: 

_Aide TM, Corrada-Bravo C, Campos-Cerqueira M, Milan C, Vega G, Alvarez R. 2013. Real-time bioacoustics monitoring and automated species identification. PeerJ 1:e103 https://doi.org/10.7717/peerj.103_`
  }
]
